# Stateful tokens

Here we've got a simple example of a stateful token.

The token is a random bunch of characters which is 32 characters long. 

This token implementation is stateful because it is stored in a variable.

The problem is that we need to `send a request to the database` every time the user wants to hit an `authenticated endpoint`.