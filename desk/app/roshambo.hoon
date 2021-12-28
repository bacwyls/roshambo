/-  *roshambo
/+  default-agent, dbug
::
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  $:
  %0
  poise=(unit poise)
  shoot-self=(unit shoot)
  shoot-opponent=(unit shoot)
  poise-delay=@dr
  latency=@dr
  verbose=?
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
++  on-fail   on-fail:def
++  on-leave  on-leave:def
++  on-agent  on-agent:def
++  on-peek  on-peek:def
++  on-init
  =.  state  init-state
  [~ this]
++  on-save
  =.  state  init-state
  !>(~)
++  on-load
  |=  =vase
  =.  state  init-state
  `this
++  on-watch
|=  =path
  ^-  (quip card _this)
  ?.  =(src.bowl our.bowl)  `this
  ?+    path  (on-watch:def path)
    [%game-updates ~]
      ?~  poise.state
        `this
      :_  this
        :~
          game-update-card
        ==
  ==
++  on-arvo
  ^+  on-arvo:*agent:gall
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?~  poise.state  `this
  ?~  shoot-self.state  `this
  ?.  =(our.bowl src.bowl)  `this
  ?.  (is-poise-active u.poise.state now.bowl)
    `this
  :_  this
    :~  shoot-card
    ==  
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+  mark  (on-poke:def mark vase)
      %noun
    ?+    q.vase  (on-poke:def mark vase)
      %print-state
    ~&  >>  state
    `this
    ==
      %roshambo-action
    =^  cards  state
    (handle-action:hc !<(action vase))
    [cards this]
      %roshambo-ui-shoot
    ?.  =(our.bowl src.bowl)  `this
    =/  =shoot
      (cord-to-shoot (cord +.q.vase))
    :_  this
      :~  (set-shoot-card our.bowl shoot)
      ==
    ::
      %roshambo-ui-poise
    ?.  =(our.bowl src.bowl)  `this
    =/  who=@p
      ^-  @p
      (slav %p (cord +.q.vase))
    :_  this
      :~  (set-poise-card our.bowl who)
      ==
  ==
--
::
:: helper core
|_  bowl=bowl:gall
++  init-state
  :*  %0
    ~  ~  ~  ~s10  ~s2  &
  ==
++  cord-to-shoot
  |=  shot=cord
  ?:  =(shot 'r')
    %r
  ?:  =(shot 'p')
    %p
  ?:  =(shot 's')
    %s
  !!
++  game-update-card
  =<
  =/  =game  make-game
  [%give %fact ~[/game-updates] [%roshambo-update !>(`^game`game)]]
  |%
  ++  make-game
    [poise.state shoot-self.state shoot-opponent.state]
  --
++  bwait
  |=  da=@da
  ^-  card
  ?~  poise.state  !!
  [%pass /wait/(scot %da da) %arvo %b %wait da]
++  brest
  |=  da=@da
  ^-  card
  :: ?~  poise.state  !!
  [%pass /wait/(scot %da da) %arvo %b %rest da]
++  bwait-proxy
  |=  da=@da
  ^-  card
  :*  %pass   /poke-wire   %agent
    [our.bowl %roshambo]
    %poke  %roshambo-action
    !>(`action`[%set %wait da])
  ==
++  brest-proxy
  |=  da=@da
  ^-  card
  :*  %pass   /poke-wire   %agent
    [our.bowl %roshambo]
    %poke  %roshambo-action
    !>(`action`[%set %rest da])
  ==
++  poise-card
  =*  poise
    ?~  poise.state  !!
    u.poise.state
  :*  %pass   /poke-wire   %agent
    [opponent.poise %roshambo]
    %poke  %roshambo-action
    !>(`action`%poise^poise)
  ==
++  set-poise-card
  |=  [our=@p who=@p]
  :*  %pass   /poke-wire   %agent
    [our %roshambo]
    %poke  %roshambo-action
    !>(`action`%set^%poise^who)
  ==
++  set-shoot-card
  |=  [our=@p =shoot]
  :*  %pass   /poke-wire   %agent
    [our %roshambo]
    %poke  %roshambo-action
    !>(`action`%set^%shoot^shoot)
  ==
++  shoot-card
  =*  poise
    ?~  poise.state  !!
    u.poise.state
  =*  shoot
    ?~  shoot-self.state  !!
    u.shoot-self.state
  :*  %pass   /poke-wire   %agent
    [opponent.poise %roshambo]
    %poke  %roshambo-action
    !>(`action`%shoot^shoot)
  ==
++  is-poise-active
  |=  [=^poise now=@da]
  ?&  (gte now shoot-time.poise)
    (lte now (add shoot-time.poise latency.poise))
  ==
++  handle-action
  |=  =action
  ^-  (quip card _state)
  ?-  -.action
  %reset
    ?.  =(our.bowl src.bowl)
      `state
    =.  poise.state  ~
    =.  shoot-self.state  ~
    =.  shoot-opponent.state  ~
    `state
  %poise
    :: agents will settle on the later time
    ?~  poise.state
      `state
    ?:  (gth now.bowl shoot-time.u.poise.state)
      `state
    =/  ipoi=^poise
      u.poise.state
    =/  upoi=^poise
      +.action
    ?.  =(src.bowl opponent.ipoi)  !!
    ?:  (gth shoot-time.upoi shoot-time.ipoi)
      =/  old-shoot-time=@da  shoot-time.ipoi
      =.  shoot-time.ipoi  shoot-time.upoi
      =.  latency.ipoi  latency.upoi
      =.  u.poise.state  ipoi
      :: reset behn
      :_  state
      :~
        (brest-proxy old-shoot-time)
        (bwait-proxy shoot-time.ipoi)
      ==
    :: send my poise again
    :_  state
      [poise-card ~]
  %shoot
    ?~  poise.state  `state
    =*  poise
      u.poise.state
    ?.  =(src.bowl opponent.poise)
      `state
    :: assert now in poise time window
    ?.  (is-poise-active poise now.bowl)
      `state
    :: TODO
    :: declare win, draw, or fail
    =.  shoot-opponent.state  [~ +.action]
    ~&  >  "GAME"
    ~&  >  [shoot-self.state shoot-opponent.state]
    :_  state
    ~[game-update-card]
  %set
    ?.  =(src.bowl our.bowl)
      `state
    ?-  +<.action
    %shoot
      =.  shoot-self.state
        [~ +>.action]
      `state
    %verbose
      =.  verbose.state
        +>.action
      `state
    %poise-delay
      =.  poise-delay.state
        +>.action
      `state
    %latency
      =.  latency.state
        +>.action
      `state
    %rest
      :_  state
        [(brest +>.action) ~]
    %wait
      :_  state
        [(bwait +>.action) ~]
    %poise
      ?.  =(src.bowl our.bowl)  `state
      =<
      =/  new-poise=^poise
        :*
          +>.action
          %+  add  now.bowl
              poise-delay.state
          latency.state
        ==
      =.  shoot-opponent.state  ~
      ?.  requires-rest
        =.  poise.state  [~ new-poise]
        :_  state
          :~  poise-card
            (bwait-proxy shoot-time.new-poise)
          ==
      ?~  poise.state  !!
      =/  old-shoot-time=@da
        shoot-time.u.poise.state
      =.  poise  [~ new-poise]
      :_  state
        :~  poise-card
          (brest-proxy old-shoot-time)
          (bwait-proxy shoot-time.u.poise.state)
        ==
      ::
      |%
      ++  requires-rest
        ?~  poise.state  |
        =*  poise  u.poise.state
        ?!  %+  gte
          now.bowl
          (add shoot-time.poise latency.poise)
      --
    ==
  ==
--

