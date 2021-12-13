# roshambo on urbit

by ~bacwyl-samweg


------

to install for dev:

create a fake galaxy

```
./urbit -F bus
```

then in ~bus do:

```
|mount %base

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

Failed to load resource: the server responded with a status of 400 (missing)
bundle.js:652 Uncaught (in promise) Error: Failed to PUT channel
    at Urbit.sendJSONtoChannel (bundle.js:652)
    at async Promise.all (/apps/roshambo/index 0)
    at async Urbit.poke (bundle.js:717)

need to set up proper mar/roshambo-action to get pokes working before i can really test the http-api urb.poke


