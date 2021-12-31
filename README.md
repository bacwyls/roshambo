# roshambo on urbit

by ~bacwyl-samweg

urbit2urbit rock paper scissors game


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

