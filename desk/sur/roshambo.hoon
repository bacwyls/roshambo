|%
+$  shoot  ?(%r %p %s)
+$  poise
  $:
    opponent=@p
    shoot-time=@da
    latency=@dr
  ==
+$  game
  $:
  poise=(unit poise)
  shoot-self=(unit shoot)
  shoot-opponent=(unit shoot)
  ==
+$  set
  $%
  [%rest @da]
  [%wait @da]
  [%verbose ?]
  [%latency @dr]
  [%poise @p]
  [%shoot shoot]
  [%poise-delay @dr]
  ==
+$  client-action
  $%
  [%poise @p]
  [%shoot @]
  ==
+$  action
  $%
  [%set set]
  [%reset ~]
  [%poise poise]
  [%shoot shoot]
  ==
--

