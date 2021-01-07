import{__spreadArrays as e,__assign as t}from"tslib";import n,{useMemo as r,useState as o,useEffect as i}from"react";import{Circle as l}from"@visx/shape";import{scaleSqrt as a,scaleOrdinal as u}from"@visx/scale";import{extent as c}from"d3-array";import"d3-time-format";import{schemeTableau10 as m}from"d3-scale-chromatic";import{useRecoilValue as f,useRecoilState as d}from"recoil";import{aesState as s,layoutState as p,labelsState as y,TooltipContainer as g,tooltipState as v,XTooltip as x,YTooltip as E,dataState as k,themeState as h,scalesState as b}from"@graphique/gg";import{voronoi as z,VoronoiPolygon as O}from"@visx/voronoi";var F=e([m[0],m[1],m[4],m[2],m[3]],m.slice(5)),S=function(e){var t=e.data,o=e.x,i=e.y,l=e.onMouseOver,a=e.onMouseLeave,u=e.onClick,c=f(s),m=f(p),d=m.width,y=m.height,g=m.margin,v=r((function(){return z({x:function(e){return o(c.x(e))},y:function(e){return i(c.y(e))},width:d,height:y}).extent([[g.left,g.top],[d-g.right,y-g.bottom-g.top]])}),[c,d,y,o,i,g])(t).polygons();return n.createElement("g",{onMouseLeave:a?function(e){return a()}:void 0},v.map((function(e,t){return n.createElement(O,{key:"voronoi-polygon-"+t,polygon:e,fill:"transparent",style:{cursor:u?"pointer":"default"},onMouseOver:l?function(n){l({d:e.data,i:t})}:void 0,onClick:u?function(n){return u({d:e.data,i:t})}:void 0})})))},_=function(e){var t=e.data,r=f(y),o=r.x,i=r.y,l=f(s),a=l.x,u=l.y;return t&&n.createElement(g,null,t.map((function(e){return n.createElement("div",{key:"group-tooltip-"+(e.label||e.group)},n.createElement("div",{style:{marginTop:4,marginBottom:4}},(e.label||"__group"!==e.group)&&n.createElement(n.Fragment,null,e.mark,n.createElement("div",{style:{display:"flex",alignItems:"flex-end",fontWeight:500}},n.createElement("div",{style:{marginBottom:4}},n.createElement("span",null,e.label||e.group," ")))),n.createElement("div",{style:{display:"flex",marginBottom:2}},n.createElement("div",null,o||a.toString(),":"),n.createElement("div",{style:{marginLeft:2,fontWeight:500,fontSize:13}},e.formattedX)),n.createElement("div",{style:{display:"flex"}},n.createElement("div",null,i||u.toString(),":"),n.createElement("div",{style:{marginLeft:2,fontWeight:500,fontSize:13}},e.formattedY))))})))},M=function(e){var t=e.scales,r=e.group,o=e.datum,i=f(v),l=i.position,a=i.content,u=i.yFormat,c=i.xFormat,m=i.xAxis,d=f(s),y=f(p),k=y.id,h=y.height,b=y.margin,z=t.x,O=t.y,F={given:d.label&&d.label(o),keyed:d.key&&d.key(o),default:null==o?void 0:o._id},S=[{x:d.x&&z(d.x(o)),y:d.y&&O(d.y(o)),formattedX:d.x&&(c?c(d.x(o)):d.x(o)),formattedY:d.y&&(u?u(d.y(o)):d.y(o)),group:r(o),label:F.given===F.default?F.keyed:F.given,datum:o}];return n.createElement(n.Fragment,null,m&&n.createElement(x,{id:k,left:S[0].x,top:-b.bottom-5,value:"boolean"==typeof m?n.createElement(g,null,c?c(d.x(o)):d.x(o)):m({x:d.x(o)})}),n.createElement(E,{id:k,left:S[0].x,top:"data"===l?-(h-S[0].y):-h,value:a?a({data:S}):n.createElement(_,{data:S})}))},L=function(e){var m=e.data,p=e.stroke,y=e.strokeWidth,g=e.fill,v=e.opacity,x=void 0===v?1:v,E=e.strokeOpacity,z=e.size,O=void 0===z?2.5:z,_=e.scales,L=e.hideTooltip,W=void 0!==L&&L,w=e.focused,B=e.focusedStyle,C=e.unfocusedStyle,A=e.onFocus,T=e.onFocusSelection,X=e.onExit,Y=f(k),q=m||Y,G=f(s),I=f(h).defaultFill,N=d(b),P=N[0],j=N[1],D=r((function(){return P}),[P]),H=D.fill,J=D.stroke,K=D.size,Q=D.groups,R=_.x,U=_.y,V=r((function(){return G.group||G.fill||G.stroke||G.size||function(e){return"__group"}}),[G]),Z=V?Array.from(new Set(q.map(V))).map((function(e){return null===e?"[null]":e})):["__group"],$=r((function(){return a({domain:O?[O]:G.size&&c(q,G.size),range:(null==K?void 0:K.range)||[3,30]})}),[q,G.size,O,K]),ee=r((function(){return function(e){return $&&G.size?$(G.size(e)):O}}),[$,G,O]),te=r((function(){return u({domain:Q,range:(null==J?void 0:J.scheme)||(p?[p]:1===(null==Q?void 0:Q.length)?[void 0]:F)})}),[Q,J,p]),ne=r((function(){return function(e){return te&&G.stroke?te(G.stroke(e)):p}}),[G,te,p]),re=r((function(){return u({domain:Q,range:(null==H?void 0:H.scheme)||(g?[g]:1===(null==Q?void 0:Q.length)?[I]:F)})}),[Q,H,g,I]),oe=r((function(){return function(e){return re&&G.fill?re(G.fill(e)):g||I}}),[G,re,g,I]),ie=o(w||[]),le=ie[0],ae=ie[1];i((function(){ae(w||[])}),[w]),i((function(){Q||j((function(e){return t(t({},e),{groups:Z})}))}),[j,Z,Q]);var ue=o({x:0,y:0})[0],ce=r((function(){return le.length||ue.x>3}),[le,ue]),me=t({fillOpacity:1,strokeOpacity:1},B),fe=t({fillOpacity:.15,strokeOpacity:.15},C);return q?n.createElement(n.Fragment,null,n.createElement("g",null,q.map((function(e,r){var o=G.key&&le.map(G.key).includes(G.key(e));return G.x(e)&&G.y(e)?n.createElement(l,{style:ce?t({},o?me:fe):{pointerEvents:"none"},key:"point-"+r,fill:oe(e),fillOpacity:x,strokeOpacity:E,stroke:ne(e),strokeWidth:y,r:O||ee(e),cx:R(G.x(e)),cy:U(G.y(e))}):null}))),!W&&n.createElement(n.Fragment,null,n.createElement(S,{data:q,x:R,y:U,onMouseOver:function(e){var t=e.d;e.i;ae([t]),A&&A({data:t})},onClick:T?function(e){var t=e.d;e.i;T({data:t})}:void 0,onMouseLeave:function(){ae([]),X&&X()}}),le&&le[0]&&n.createElement(M,{group:V,datum:le[0],scales:_}))):null};L.displayName="GeomPoint";export{L as GeomPoint};
//# sourceMappingURL=index.esm.js.map