/+  default-agent
::
|%
::
+$  card  card:agent:gall
--
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    hc    ~(. +> bowl)
::
++  on-init  [~ this]
++  on-save  !>(~)
++  on-load  _on-init
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+  mark  (on-poke:def mark vase)
    %roshambo-action
      ~&  >>  "ribbit"
      ~&  >>  vase
      `this
  ==
++  on-watch  on-watch:def
++  on-leave  on-leave:def
++  on-peek   on-peek:def
++  on-agent  on-agent:def
++  on-arvo   on-arvo:def
++  on-fail   on-fail:def
--

