Introduction
============

Matrix is an ambitious new ecosystem for open federated Instant Messaging and
VoIP.  The basics you need to know to get up and running are:

- Chatrooms are distributed and do not exist on any single server.  Rooms
  can be found using aliases like ``#matrix:matrix.org`` or
  ``#test:localhost:8008`` or they can be ephemeral.

- Matrix user IDs look like ``@matthew:matrix.org`` (although in the future
  you will normally refer to yourself and others using a 3PID: email
  address, phone number, etc rather than manipulating Matrix user IDs)

The overall architecture is::

      client <----> homeserver <=====================> homeserver <----> client
             https://somewhere.org/_matrix      https://elsewhere.net/_matrix

WARNING
=======

**Synapse is currently in a state of rapid development, and not all features
are yet functional. Critically, some security features are still in
development, which means Synapse can *not* be considered secure or reliable at
this point.**  For instance:

- **SSL Certificates used by server-server federation are not yet validated.**
- **Room permissions are not yet enforced on traffic received via federation.**
- **Homeservers do not yet cryptographically sign their events to avoid
  tampering**
- Default configuration provides open signup to the service from the internet

Despite this, we believe Synapse is more than useful as a way for experimenting
and exploring Synapse, and the missing features will land shortly. **Until
then, please do *NOT* use Synapse for any remotely important or secure
communication.**


Quick Start
===========

System requirements:
- POSIX-compliant system (tested on Linux & OSX)
- Python 2.7

To get up and running:

- To simply play with an **existing** homeserver you can
  just go straight to http://matrix.org/alpha.

- To run your own **private** homeserver on localhost:8008, generate a basic
  config file: ``./synctl start`` will give you instructions on how to do this.
  For this purpose, you can use 'localhost' or your hostname as a server name.
  Once you've done so, running ``./synctl start`` again will start your private
  home sserver. You will find a webclient running at http://localhost:8008.
  Please use a recent Chrome or Firefox for now (or Safari if you don't need
  VoIP support).

- To run a **public** homeserver and let it exchange messages with other
  homeservers and participate in the global Matrix federation, you must expose
  port 8448 to the internet and edit homeserver.yaml to specify server_name
  (the public DNS entry for this server) and then run ``synctl start``. If you
  changed the server_name, you may need to move the old database
  (homeserver.db) out of the way first. Then come join ``#matrix:matrix.org``
  and say hi! :)

For more detailed setup instructions, please see further down this document.


About Matrix
============

Matrix specifies a set of pragmatic RESTful HTTP JSON APIs as an open standard,
which handle:

- Creating and managing fully distributed chat rooms with no
  single points of control or failure
- Eventually-consistent cryptographically secure[1] synchronisation of room
  state across a global open network of federated servers and services
- Sending and receiving extensible messages in a room with (optional)
  end-to-end encryption[2]
- Inviting, joining, leaving, kicking, banning room members
- Managing user accounts (registration, login, logout)
- Using 3rd Party IDs (3PIDs) such as email addresses, phone numbers,
  Facebook accounts to authenticate, identify and discover users on Matrix.
- Placing 1:1 VoIP and Video calls

These APIs are intended to be implemented on a wide range of servers, services
and clients, letting developers build messaging and VoIP functionality on top
of the entirely open Matrix ecosystem rather than using closed or proprietary
solutions. The hope is for Matrix to act as the building blocks for a new
generation of fully open and interoperable messaging and VoIP apps for the
internet.

Synapse is a reference "homeserver" implementation of Matrix from the core
development team at matrix.org, written in Python/Twisted for clarity and
simplicity.  It is intended to showcase the concept of Matrix and let folks see
the spec in the context of a codebase and let you run your own homeserver and
generally help bootstrap the ecosystem.

In Matrix, every user runs one or more Matrix clients, which connect through to
a Matrix homeserver which stores all their personal chat history and user
account information - much as a mail client connects through to an IMAP/SMTP
server. Just like email, you can either run your own Matrix homeserver and
control and own your own communications and history or use one hosted by
someone else (e.g. matrix.org) - there is no single point of control or
mandatory service provider in Matrix, unlike WhatsApp, Facebook, Hangouts, etc.

Synapse ships with two basic demo Matrix clients: webclient (a basic group chat
web client demo implemented in AngularJS) and cmdclient (a basic Python
command line utility which lets you easily see what the JSON APIs are up to).

We'd like to invite you to take a look at the Matrix spec, try to run a
homeserver, and join the existing Matrix chatrooms already out there,
experiment with the APIs and the demo clients, and let us know your thoughts at
https://github.com/matrix-org/synapse/issues or at matrix@matrix.org.

Thanks for trying Matrix!

[1] Cryptographic signing of messages isn't turned on yet

[2] End-to-end encryption is currently in development


Homeserver Installation
=======================

First, the dependencies need to be installed.  Start by installing
'python2.7-dev' and the various tools of the compiler toolchain.

Installing prerequisites on Ubuntu::

    $ sudo apt-get install build-essential python2.7-dev libffi-dev

Installing prerequisites on Mac OS X::

    $ xcode-select --install

The homeserver has a number of external dependencies, that are easiest
to install by making setup.py do so, in --user mode::

    $ python setup.py develop --user

You'll need a version of setuptools new enough to know about git, so you
may need to also run::

    $ sudo apt-get install python-pip
    $ sudo pip install --upgrade setuptools

If you don't have access to github, then you may need to install ``syutil``
manually by checking it out and running ``python setup.py develop --user`` on
it too.

If you get errors about ``sodium.h`` being missing, you may also need to
manually install a newer PyNaCl via pip as setuptools installs an old one. Or
you can check PyNaCl out of git directly (https://github.com/pyca/pynacl) and
installing it. Installing PyNaCl using pip may also work (remember to remove
any other versions installed by setuputils in, for example, ~/.local/lib).

On OSX, if you encounter ``clang: error: unknown argument: '-mno-fused-madd'``
you will need to ``export CFLAGS=-Qunused-arguments``.

This will run a process of downloading and installing into your
user's .local/lib directory all of the required dependencies that are
missing.

Once this is done, you may wish to run the homeserver's unit tests, to
check that everything is installed as it should be::

    $ python setup.py test

This should end with a 'PASSED' result::

    Ran 143 tests in 0.601s

    PASSED (successes=143)


Upgrading an existing homeserver
================================

Before upgrading an existing homeserver to a new version, please refer to
UPGRADE.rst for any additional instructions.


Setting up Federation
=====================

In order for other homeservers to send messages to your server, it will need to
be publicly visible on the internet, and they will need to know its host name.
You have two choices here, which will influence the form of your Matrix user
IDs:

1) Use the machine's own hostname as available on public DNS in the form of
   its A or AAAA records. This is easier to set up initially, perhaps for
   testing, but lacks the flexibility of SRV.

2) Set up a SRV record for your domain name. This requires you create a SRV
   record in DNS, but gives the flexibility to run the server on your own
   choice of TCP port, on a machine that might not be the same name as the
   domain name.

For the first form, simply pass the required hostname (of the machine) as the
--host parameter::

    $ python synapse/app/homeserver.py \
        --server-name machine.my.domain.name \
        --config-path homeserver.config \
        --generate-config
    $ python synapse/app/homeserver.py --config-path homeserver.config

Alternatively, you can run synapse via synctl - running ``synctl start`` to
generate a homeserver.yaml config file, where you can then edit server-name to
specify machine.my.domain.name, and then set the actual server running again
with synctl start.

For the second form, first create your SRV record and publish it in DNS. This
needs to be named _matrix._tcp.YOURDOMAIN, and point at at least one hostname
and port where the server is running.  (At the current time synapse does not
support clustering multiple servers into a single logical homeserver).  The DNS
record would then look something like::

    _matrix._tcp    IN      SRV     10 0 8448 machine.my.domain.name.

At this point, you should then run the homeserver with the hostname of this
SRV record, as that is the name other machines will expect it to have::

    $ python synapse/app/homeserver.py \
        --server-name YOURDOMAIN \
        --bind-port 8448 \
        --config-path homeserver.config \
        --generate-config
    $ python synapse/app/homeserver.py --config-path homeserver.config


You may additionally want to pass one or more "-v" options, in order to
increase the verbosity of logging output; at least for initial testing.

For the initial alpha release, the homeserver is not speaking TLS for
either client-server or server-server traffic for ease of debugging. We have
also not spent any time yet getting the homeserver to run behind loadbalancers.

Running a Demo Federation of Homeservers
----------------------------------------

If you want to get up and running quickly with a trio of homeservers in a
private federation (``localhost:8080``, ``localhost:8081`` and
``localhost:8082``) which you can then access through the webclient running at
http://localhost:8080. Simply run::

    $ demo/start.sh

Running The Demo Web Client
===========================

The homeserver runs a web client by default at https://localhost:8448/.

If this is the first time you have used the client from that browser (it uses
HTML5 local storage to remember its config), you will need to log in to your
account. If you don't yet have an account, because you've just started the
homeserver for the first time, then you'll need to register one.


Registering A New Account
-------------------------

Your new user name will be formed partly from the hostname your server is
running as, and partly from a localpart you specify when you create the
account. Your name will take the form of::

    @localpart:my.domain.here
         (pronounced "at localpart on my dot domain dot here")

Specify your desired localpart in the topmost box of the "Register for an
account" form, and click the "Register" button. Hostnames can contain ports if
required due to lack of SRV records (e.g. @matthew:localhost:8448 on an
internal synapse sandbox running on localhost)


Logging In To An Existing Account
---------------------------------

Just enter the ``@localpart:my.domain.here`` Matrix user ID and password into
the form and click the Login button.


Identity Servers
================

The job of authenticating 3PIDs and tracking which 3PIDs are associated with a
given Matrix user is very security-sensitive, as there is obvious risk of spam
if it is too easy to sign up for Matrix accounts or harvest 3PID data.
Meanwhile the job of publishing the end-to-end encryption public keys for
Matrix users is also very security-sensitive for similar reasons.

Therefore the role of managing trusted identity in the Matrix ecosystem is
farmed out to a cluster of known trusted ecosystem partners, who run 'Matrix
Identity Servers' such as ``sydent``, whose role is purely to authenticate and
track 3PID logins and publish end-user public keys.

It's currently early days for identity servers as Matrix is not yet using 3PIDs
as the primary means of identity and E2E encryption is not complete. As such,
we are running a single identity server (http://matrix.org:8090) at the current
time.


Where's the spec?!
==================

For now, please go spelunking in the ``docs/`` directory to find out.


Building Internal API Documentation
===================================

Before building internal API documentation install spinx and
sphinxcontrib-napoleon::

    $ pip install sphinx
    $ pip install sphinxcontrib-napoleon

Building internal API documentation::

    $ python setup.py build_sphinx

