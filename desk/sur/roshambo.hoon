|%
::
:: game
  :: expires after wndw
  :: data before wndw is ignored
+$  wndw  [s=@da e=@da]
:: wins / losses
+$  scor  [w=@ud l=@ud]
:: hand gesture
+$  shut  (unit ?(%r %p %s))
:: game state sent between agents
+$  game
  $:
  enme=@p  =wndw
  =scor
  mine=shut
  ther=shut
  ==
::
::  game states sent as a share
::  every share has a purpose
::  init:  start the game
::  hand:  sending my hand
::  ctnu:  declare winner to start another round
+$  share  $:
  ?(%init %hand %ctnu)
  game
  ==
::
:: challenge
  :: challenger, challengee
  :: and a timestamp
  :: --
  :: in practice: a list of
  :: incoming / outgoing subs
+$  chlg  $:
   wen=@da
   er=@p    ee=@p
   ==
::
:: action
  :: UI . all pokes
+$  action
  :: commands for ui
  $%
  :: ignored after first choice
  :: ignored if ~
    [%shoot shut]
  ::
  :: play again with same opp
  :: must agree on scor
    [%again ~]
  ::
  :: exit game by unsub
    [%exit ~]
  ::
  :: sub to who
  :: update chlgs
    [%chlng @p]
  ::
  :: sub to chlger
  :: init game with:
      :: wndw  (add now x)
      :: scor  [0 0]
      :: oppt  chlgr
      :: shut  ~
    :: chlgee sets game & subs
    :: upon sub from ee, er inits game
    ::  with same wndw as ee
    [%accpt @p]
  ::
  :: share new game to subs
    [%share share]
  ==
--

