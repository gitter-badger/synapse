# -*- coding: utf-8 -*-
# Copyright 2014 OpenMarket Ltd
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from synapse.api.errors import SynapseError
from synapse.types import StreamToken

import logging


logger = logging.getLogger(__name__)


class PaginationConfig(object):

    """A configuration object which stores pagination parameters."""

    def __init__(self, from_token=None, to_token=None, direction='f',
                 limit=0):
        self.from_token = from_token
        self.to_token = to_token
        self.direction = 'f' if direction == 'f' else 'b'
        self.limit = int(limit)

    @classmethod
    def from_request(cls, request, raise_invalid_params=True):
        def get_param(name, default=None):
            lst = request.args.get(name, [])
            if len(lst) > 1:
                raise SynapseError(
                    400, "%s must be specified only once" % (name,)
                )
            elif len(lst) == 1:
                return lst[0]
            else:
                return default

        direction = get_param("dir", 'f')
        if direction not in ['f', 'b']:
            raise SynapseError(400, "'dir' parameter is invalid.")

        from_tok = get_param("from")
        to_tok = get_param("to")

        try:
            if from_tok == "END":
                from_tok = None  # For backwards compat.
            elif from_tok:
                from_tok = StreamToken.from_string(from_tok)
        except:
            raise SynapseError(400, "'from' paramater is invalid")

        try:
            if to_tok:
                to_tok = StreamToken.from_string(to_tok)
        except:
            raise SynapseError(400, "'to' paramater is invalid")

        limit = get_param("limit", "0")
        if not limit.isdigit():
            raise SynapseError(400, "'limit' parameter must be an integer.")

        try:
            return PaginationConfig(from_tok, to_tok, direction, limit)
        except:
            logger.exception("Failed to create pagination config")
            raise SynapseError(400, "Invalid request.")

    def __str__(self):
        return (
            "<PaginationConfig from_tok=%s, to_tok=%s, "
            "direction=%s, limit=%s>"
        ) % (self.from_token, self.to_token, self.direction, self.limit)
