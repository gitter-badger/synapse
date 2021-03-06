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

from .room import (
    RoomMemberEvent, RoomJoinRulesEvent, RoomPowerLevelsEvent,
    RoomAddStateLevelEvent, RoomSendEventLevelEvent, RoomOpsPowerLevelsEvent,
    RoomAliasesEvent, RoomCreateEvent,
)

def prune_event(event):
    """ Prunes the given event of all keys we don't know about or think could
    potentially be dodgy.

    This is used when we "redact" an event. We want to remove all fields that
    the user has specified, but we do want to keep necessary information like
    type, state_key etc.
    """

    # Remove all extraneous fields.
    event.unrecognized_keys = {}

    new_content = {}

    def add_fields(*fields):
        for field in fields:
            if field in event.content:
                new_content[field] = event.content[field]

    if event.type == RoomMemberEvent.TYPE:
        add_fields("membership")
    elif event.type == RoomCreateEvent.TYPE:
        add_fields("creator")
    elif event.type == RoomJoinRulesEvent.TYPE:
        add_fields("join_rule")
    elif event.type == RoomPowerLevelsEvent.TYPE:
        # TODO: Actually check these are valid user_ids etc.
        add_fields("default")
        for k, v in event.content.items():
            if k.startswith("@") and isinstance(v, (int, long)):
                new_content[k] = v
    elif event.type == RoomAddStateLevelEvent.TYPE:
        add_fields("level")
    elif event.type == RoomSendEventLevelEvent.TYPE:
        add_fields("level")
    elif event.type == RoomOpsPowerLevelsEvent.TYPE:
        add_fields("kick_level", "ban_level", "redact_level")
    elif event.type == RoomAliasesEvent.TYPE:
        add_fields("aliases")

    event.content = new_content

    return event
