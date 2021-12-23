# roshambo on urbit

by ~bacwyl-samweg

p2p protocol for rock paper scissors

~bus sends a %poise to ~run with a time-window when ~bus plans to %shoot.
if ~run is up for it, ~run will return a %poise with the same time-window.
otherwise, ~run will return a %chill.

when the time comes, ~run and ~bus will %shoot

only one %shoot is accepted in the window and %shoot is ignored outside the window.

.

~run and ~bus send one another a %poise (timestamped)
they use the nearest shoot-time

our %poise
  set poise in state and
  send to their
their %poise
  

.

a behn timer will fire at shoot-time and send a %shoot
  it will use a ?[%r %p %s] value from the agent state
  which can be set by self %shoot pokes



------

to install for dev:

create a fake galaxy

```
./urbit -F bus
```

then in ~bus do:

```
|merge %roshambo our %base

|mount %roshambo
```

then in unix, in your pier directory, do:

```cp -R <this repo>/desk/* roshambo```

in ~bus:

```|commit %roshambo```
```|install our %roshambo```

in web browser go to localhost/docket/upload

login with ~bus ```+code```

select desk: roshambo
select glob: <this repo>/glob
GLOB
%roshambo will be a github repo with /glob and /desk

/glob will contain files to glob and instructions for globbing
to glob, must do npm install @urbit/http-api
and then browserify script.js -o bundle.js

this is to use @urbit/http-api npm package

should be installed now. go to localhost in web browser and click on roshambo tile

---

known issues:

it doesnt work at all.

