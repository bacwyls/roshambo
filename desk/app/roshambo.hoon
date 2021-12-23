/-  *roshambo
/+  default-agent, dbug
::
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  $:
  %0
  game=(unit game)
  chlgs=(list chlg)
  ==
+$  card     card:agent:gall
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    hc    ~(. +> bowl)
::
++  on-init   [~ this]
++  on-save   !>(~)
++  on-load   on-load:def
++  on-arvo   on-arvo:def
++  on-peek   on-peek:def
++  on-fail   on-fail:def
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ~&  >>>  "on-watch"
  ~&  >>>  path
  :: every sub is a challenger
  ?+    path  (on-watch:def path)
    [%game ~]
      ?:  |-
          ?~  chlgs  |
          ?:  =(ee.i.chlgs src.bowl)  &
          $(chlgs t.chlgs)
        ~&  >  "accepted!"
        =.  game.state  (make-game src.bowl now.bowl)
        =.  chlgs.state  ~
        ?~  game.state  !!
        `this
        :: :_  this
        :: :~  [%give %fact ~[/game] %roshambo-action !>([%share u.game.state])]
        :: ==
      =|  =chlg
      =.  er.chlg   src.bowl
      =.  ee.chlg   our.bowl
      =.  wen.chlg  now.bowl
      =.  chlgs.state
        (snoc chlgs.state chlg)
      `this
  ==
::
++  on-agent 
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ~&  >>>  "on-agent"
  ~&  >>>  [wire sign]
  ?+    wire  (on-agent:def wire sign)
      [%play ~]
    ?+    -.sign  (on-agent:def wire sign)
        %kick
      ~&  >  "kick"
      ~&  >  state
      =.  state  *state-0
      :: TODO reset state to bunt
      `this
    ::
        %fact
      ~&  >  "fact"
      =|  =action
      =.  action  !<(^action q.cage.sign)
      ~&  >  action
      :: ?+    p.cage.sign  (on-agent:def wire sign)
      ::     %roshambo-action
          `this
    ::
        %watch-ack
      ?~  p.sign
        ((slog '%roshambo: Subscribe succeeded!' ~) `this)
      ((slog '%roshambo: Subscribe failed!' ~) `this)
    ::
    ==
  ==
++  on-leave
  |=  =path
  ~&  >>>  "on-leave"
  ~&  >>>  path
  `this
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ~&  >>>  "on-poke"
  ~&  >>>  [mark vase]
  ?.  =(src.bowl our.bowl)
    `this
  ?+  mark  (on-poke:def mark vase)
      %noun
    ?+    q.vase  (on-poke:def mark vase)
      %print-state
    ~&  >>  "got print-state"
    ~&  >>  state
    ~&  >>>  bowl  `this
    ==
      %roshambo-action
    ~&  >>>  vase
    ~&  >>>  !<(action vase)
    =^  cards  state
    (handle-action:hc !<(action vase))
    [cards this]
  ==
--
::
:: helper core
|_  bowl=bowl:gall
++  handle-action
  |=  =action
  ^-  (quip card _state)
  ~&  >  state
  ~&  >  "got poke"
  ~&  >  action
  ?-  -.action
  %shoot
    ?.  =(src.bowl our.bowl)  !!
    ?~  +.action    !!
    ?~  game.state  !!
    =.  mine.u.game.state  +.action
    :_  state
    :~
      [%give %fact ~[/game] %roshambo-action !>(`^action`%share^%hand^u.game.state)]
    ==
  %exit
    ?.  =(src.bowl our.bowl)  !!
    ?~  game.state  !!
    =/  who=@p  enme.u.game.state
    :_  state(game ~)
    ::  ?~  game.state  !!
    :~  [%pass /play %agent [who %roshambo] %leave ~]
      ==
  %chlng 
    ?.  =(src.bowl our.bowl)  !!
    ?:  |-
        ?~  chlgs  |
        ?:  =(ee.i.chlgs +.action)  &
        $(chlgs t.chlgs)
      ~&  >  "already challenged"
      `state
    =|  =chlg
    =.  wen.chlg  now.bowl
    =.  er.chlg   our.bowl
    =.  ee.chlg   +.action
    =.  chlgs.state
        (snoc chlgs.state chlg)
    :_  state
    :~  [%pass /play %agent [+.action %roshambo] %watch /game]
      ==
  %accpt
    ?.  |-
        ?~  chlgs  |
        ?:  =(er.i.chlgs +.action)  &
        $(chlgs t.chlgs)
      ~&  >  "not challenged"
      `state
    =.  game.state  (make-game +.action now.bowl)
    ?~  game.state  !!
    =.  chlgs.state  ~
    :_  state
    :~  [%pass /play %agent [+.action %roshambo] %watch /game]
        [%give %fact ~[/game] %roshambo-action !>(`^action`%share^%init^u.game.state)]
    ==
  %again  `state
  %share  `state
  ::      [%pass /poke-wire %agent [~bus %roshambo] %poke %roshambo-action !>(action)]
  ==
++  make-game
  |=  [enme=@p born=@da]
  :: ^-  game
  ~&  >>>  "make game: born"
  ~&  >>>  born
  :-  ~
  :*  enme
      [born `@da`(add born ~m2)]
      [0 0]
      ~
      ~
    ==
--

