# roshambo on urbit

by ~bacwyl-samweg

urbit2urbit rock paper scissors game

------
roshambo implements a simple protocol of pokes between agents

two agents communicate by %poise pokes until they agree on an exact time window for play: (t0, t0+n)

> t0 : shoot-time.poise
> n : latency.poise

agents send a %shoot poke at exactly t0 and accept a %shoot from the opponent until t0+n

> L : the actual latency of the connection

if ```(n >= L) && (n < 2*L)```,
each agent must send their %shoot before receiving the opposing %shoot.

latency can be tweaked manually from dojo, but by default its set to a generous value to ensure that games will go through.

you can pretty much assume anyone who is using this app isn't using a modified version in order to cheat so its alright to use a large window.

the window also serves to negotiate games without a more complicated challenging or room mechanism.


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

( you probably also need some files from urbit/urbit/pkg/base-dev and garden-dev )

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
to glob, must do
npm install @urbit/http-api
npm install urbit-ob
browserify script.js -o bundle.js

---

