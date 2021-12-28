/-  roshambo
=,  format
|_  act=client-action:roshambo
++  grab
  |%  
  ++  noun  client-action:roshambo
  ++  json
    |=  jon=^json
    %-  client-action:roshambo
    ~&  >  jon
    =<  (client-action jon)
    |%
    ++  client-action
      %-  of:dejs
      :~  [%poise parse-poise]
          [%shoot parse-shoot]
      ==
    ++  parse-poise
      %-  ot:dejs
      :~  [%who (se:dejs %p)]
      ==
    ++  parse-shoot
      %-  ot:dejs
      :~  [%shot ni:dejs]
      ==
    --
  --  
++  grow
  |%
  ++  noun  act
  --  
++  grad  %noun
--

