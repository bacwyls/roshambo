/-  roshambo
=,  format
|_  gam=game:roshambo
++  grab
  |%  
  ++  noun  game:roshambo
  --  
++  grow
  |%  
  ++  noun  gam
  ++  json
    %-  pairs:enjs
    :~
      :-  'poise'
        %-  pairs:enjs
        ?~  poise.gam  ~
        :~
          ['opponent' (ship:enjs opponent.u.poise.gam)]
          ['shoot-time' (time:enjs shoot-time.u.poise.gam)]
          ['latency' (numb:enjs (msec:milly latency.u.poise.gam))]
        ==
      :-  'shoot-self'
        %-  pairs:enjs
        ?~  shoot-self.gam  ~
        :~
          ['shot' [%s u.shoot-self.gam]]
        ==
      :-  'shoot-opponent'
        %-  pairs:enjs
        ?~  shoot-opponent.gam  ~
        :~
          ['shot' [%s u.shoot-opponent.gam]]
        ==
    ==
  --  
++  grad  %noun
--

