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
  ifist=(unit shoot)
  ufist=(unit shoot)
  delay=@dr
  flexi=@dr
  verbs=?
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
++  on-peek   on-peek:def
++  on-fail   on-fail:def
++  on-watch  on-watch:def
++  on-leave  on-leave:def
++  on-agent  on-agent:def
++  on-arvo
  ^+  on-arvo:*agent:gall
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?~  poise.state  `this
  ?~  ifist.state  `this
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
  ==
--
::
:: helper core
|_  bowl=bowl:gall
++  init-state
  :*  %0
    ~  ~  ~  ~s20  ~s2  &
  ==
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
++  chill-card
  |=  who=@p
  :*  %pass   /poke-wire   %agent
    [who %roshambo]
    %poke  %roshambo-action
    !>(`action`[%chill ~])
  ==
++  poise-card
  =*  poise
    ?~  poise.state  !!
    u.poise.state
  :*  %pass   /poke-wire   %agent
    [who.poise %roshambo]
    %poke  %roshambo-action
    !>(`action`%poise^poise)
  ==
++  shoot-card
  =*  poise
    ?~  poise.state  !!
    u.poise.state
  =*  shoot
    ?~  ifist.state  !!
    u.ifist.state
  :*  %pass   /poke-wire   %agent
    [who.poise %roshambo]
    %poke  %roshambo-action
    !>(`action`%shoot^shoot)
  ==
++  handle-action
  |=  =action
  ^-  (quip card _state)
  ?-  -.action
  %poise
    :: agents will settle on the later time
    ?~  poise.state
      `state
    ?:  (gth now.bowl wen.u.poise.state)
      `state
    =/  ipoi=^poise
      u.poise.state
    =/  upoi=^poise
      +.action
    ?.  =(src.bowl who.ipoi)  !!
    ?:  (gth wen.upoi wen.ipoi)
      =/  oldwen=@da  wen.ipoi
      =.  wen.ipoi  wen.upoi
      =.  viv.ipoi  viv.upoi
      =.  u.poise.state  ipoi
      :: reset behn
      :_  state
      :~
        (brest-proxy oldwen)
        (bwait-proxy wen.ipoi)
      ==
    :: send my poise again
    :_  state
      [poise-card ~]
  %shoot
    ?~  poise.state  `state
    =*  poise
      u.poise.state
    ?:  =(src.bowl who.poise)
      :: assert now in poise time window
      ?.  &((gte now.bowl wen.poise) (lte now.bowl (add wen.poise viv.poise)))
        ~&  >>>  "bad timing"
        ~&  >>>  now.bowl
        !!
      :: TODO
      :: declare win, draw, or fail
      =.  ufist.state  [~ +.action]
      ~&  >  "GAME"
      ~&  >  [ifist ufist]
      `state
    !!
  %chill
    :: TODO does nothing
    `state
  %set
    ?.  =(src.bowl our.bowl)  `state
    ?-  +<.action
    %shoot
      =.  ifist.state  [~ +>.action]
      `state
    %verbs
      =.  verbs.state  +>.action
      `state
    %delay
      =.  delay.state  +>.action
      `state
    %flexi
      =.  delay.state  +>.action
      `state
    %rest
      :_  state
        [(brest +>.action) ~]
    %wait
      ~&  >  +>.action
      :_  state
        [(bwait +>.action) ~]
    %poise
      =/  oldwen=@da
        :: bunt if no poise or expired poise
        ?~  poise.state 
          *@da
        ?:  (gte now.bowl (add wen.u.poise.state viv.u.poise.state))
          *@da
        wen.u.poise.state
      =/  wen=@da  (add now.bowl delay.state)
      =.  poise.state
        :*  ~
          who.+>.action 
          wen
          flexi.state
        ==
      :_  state
        :: TODO add behn call
        ?:  =(oldwen *@da)  
          :~
            poise-card
            (bwait-proxy wen)
          ==
        :~
          poise-card
          (brest-proxy oldwen)
          (bwait-proxy wen)
        ==

    ==
  ==
--

