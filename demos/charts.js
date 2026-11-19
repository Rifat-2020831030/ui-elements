// All chart geometry and the accompanying table use the same selected dataset.
(() => {
  const ink = '#284b49', green = '#37765d', blue = '#376794', gold = '#a26018';
  const colors = [green, blue, gold, '#81567d'];
  const rect = (x, y, w, h, fill) => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';
  const line = (x1,y1,x2,y2,stroke=ink,width=1) => '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
  const dot = (x,y,r,fill) => '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"/>';
  const label = (x,y,s,anchor='middle',fill=ink) => '<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-size="12" fill="'+fill+'">'+s+'</text>';
  const path = (d,fill='none',stroke='none',width=1) => '<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
  function register(name,title,headings,periods,draw,inspect) {
    demos[name] = container => {
      container.innerHTML = '<label>Reporting period <select><option>This week</option><option>Last week</option><option>No observations</option></select></label><div class="chart-content"></div>';
      const period = container.querySelector('select'), content = container.querySelector('.chart-content');
      let shape;
      if (name === 'Pie and donut chart') {
        const label = document.createElement('label');
        label.innerHTML = ' Chart shape <select><option>Donut</option><option>Pie</option></select>';
        content.before(label);
        shape = label.querySelector('select');
        shape.onchange = update;
      }
      function update() {
        const rows = periods[period.selectedIndex] || [];
        if (!rows.length) {
          content.innerHTML = '<p role="status">No observations for this reporting period.</p>';
          return;
        }
        content.innerHTML = '<figure style="margin:1em 0"><figcaption><strong>'+title+'</strong></figcaption><svg role="img" aria-label="'+title+'" viewBox="0 0 450 210" style="display:block;width:100%;height:auto;max-width:640px"></svg></figure><details><summary>Inspect data values</summary><div style="overflow-x:auto"><table><caption>'+title+'</caption><thead><tr>'+headings.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr><th scope="row">'+row[0]+'</th>'+row.slice(1).map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></details>';
        const svg = content.querySelector('svg');
        if (inspect) {
          const control = document.createElement('label');
          control.innerHTML = 'Inspect service <select>'+nodes.map(n=>'<option>'+n[0]+'</option>').join('')+'</select>';
          content.prepend(control);
          const select = control.querySelector('select');
          const report = document.createElement('output');
          control.after(report);
          const focus = () => {
            svg.innerHTML = draw(rows,select.value);
            const neighbors = rows.filter(r=>r[0]===select.value).map(r=>r[1]);
            report.textContent = select.value+' calls '+(neighbors.join(', ')||'no downstream services')+'.';
          };
          select.onchange = focus;
          focus();
        } else svg.innerHTML = draw(rows, shape?.value);
      }
      period.onchange = update;
      update();
    };
  }
  const orders = [
    [['North',36,14],['Central',24,22],['South',18,10]],
    [['North',21,17],['Central',31,15],['South',12,19]]
  ];
  const totals = orders.map(rows=>rows.map(([region,a,b])=>[region,a+b]));
  function horizontalBars(rows,kind) {
    let result = line(83,25,83,173);
    rows.forEach(([name,a,b],i)=>{
      const y = 31+i*49;
      result += label(74,y+14,name,'end');
      if (kind==='grouped') {
        result += rect(83,y,a*5,12,green)+rect(83,y+15,b*5,12,blue)+label(89+a*5,y+11,a,'start')+label(89+b*5,y+26,b,'start');
      } else {
        result += rect(83,y,a*5,23,green)+label(83+a*2.5,y+16,a,'middle','white');
        if (kind==='stacked') result += rect(83+a*5,y,b*5,23,blue)+label(83+a*5+b*2.5,y+16,b,'middle','white');
      }
    });
    const legend = kind==='stacked'?'Standard first · Express second':'Standard above · Express below';
    return result + label(225,195,kind==='single'?'Orders':legend);
  }
  register('Bar chart','Completed orders by region',['Region','Orders'],totals,r=>horizontalBars(r,'single'));
  for(const [name,kind] of [['Stacked bar chart','stacked'],['Grouped bar chart','grouped']])
    register(name,'Standard and express orders',['Region','Standard','Express'],orders,r=>horizontalBars(r,kind));

  const daily = [
    [['Mon',20,4],['Tue',28,6],['Wed',25,5],['Thu',39,9],['Fri',45,8]],
    [['Mon',32,7],['Tue',22,4],['Wed',35,6],['Thu',31,8],['Fri',40,7]]
  ];
  const trend = daily.map(rows=>rows.map(row=>row.slice(0,2)));
  function series(rows,kind) {
    const x=i=>55+i*82, y=v=>166-v*2.7;
    const points = rows.map((r,i)=>[x(i),y(r[1])]);
    const trace = points.map(p=>p.join(' ')).join(' L');
    if (kind==='spark') {
      const compact = points.map(([a,b])=>(95+a*.53)+' '+(54+b*.48)).join(' L');
      return label(222,65,'Daily orders · Monday to Friday')+path('M'+compact,'none',green,3)+label(225,152,rows[0][1]+' → '+rows[rows.length-1][1]+' orders');
    }
    let result = '';
    for (const t of [0,25,50]) result += line(44,y(t),410,y(t),'#bdcfca')+label(37,y(t)+4,t,'end');
    if(kind==='combo'){
      result += rows.map((r,i)=>rect(x(i)-10,y(r[1]),20,166-y(r[1]),blue)).join('');
      const express = rows.map((r,i)=>x(i)+' '+y(r[2])).join(' L');
      result += path('M'+express,'none',gold,3)+rows.map((r,i)=>dot(x(i),y(r[2]),4,gold)).join('');
    } else {
      if(kind==='area') result += path('M'+x(0)+' 166 L'+trace+' L'+x(rows.length-1)+' 166 Z','#bcdbcc');
      result += path('M'+trace,'none',green,3)+points.map(([a,b])=>dot(a,b,4,green)).join('');
    }
    return result + rows.map((r,i)=>label(x(i),184,r[0])).join('')+label(225,204,kind==='combo'?'Bars: all orders · Line: express orders':'Completed orders');
  }
  for (const [name,kind] of [['Line chart','line'],['Area chart','area'],['Sparkline','spark']])
    register(name,'Daily order volume',['Day','Orders'],trend,r=>series(r,kind));
  register('Combination chart','Express orders within daily volume',['Day','All orders','Express orders'],daily,r=>series(r,'combo'));

  register('Funnel chart','Checkout completion',['Stage','Customers','Loss from previous stage'],[
    [['Cart',100],['Address',80],['Payment',55],['Purchased',48]],
    [['Cart',90],['Address',68],['Payment',60],['Purchased',53]]
  ].map(stages => stages.map(([stage,count],i) => [stage, count, i ? Math.round((1-count/stages[i-1][1])*100)+'%' : 'Starting stage'])),
  rows=>rows.map(([s,v],i)=>rect(220-v*1.7,10+i*48,v*3.4,40,colors[i])+label(220,35+i*48,s+' · '+v,'middle','white')).join(''));

  register('Pie and donut chart','Share of completed orders',['Region','Orders'],totals,(rows,shape)=>{
    const total = rows.reduce((a,r)=>a+r[1],0);
    let start = -Math.PI/2;
    return rows.map(([name,v],i)=>{
      const end = start+2*Math.PI*v/total;
      const point = a=>(132+78*Math.cos(a))+' '+(103+78*Math.sin(a));
      const sector = path('M132 103 L'+point(start)+' A78 78 0 '+(end-start>Math.PI?1:0)+' 1 '+point(end)+' Z',colors[i],'white',2);
      start=end;
      return sector+rect(247,52+i*36,13,13,colors[i])+label(268,63+i*36,name+' · '+Math.round(v*100/total)+'%','start');
    }).join('')+(shape === 'Pie' ? '' : dot(132,103,39,'white')+label(132,107,total+' orders'));
  });
  register('Histogram','Delivery duration distribution',['Minutes (lower inclusive, upper exclusive)','Deliveries'],[
    [['0–10',3],['10–20',7],['20–30',12],['30–40',5],['40–50',2]],
    [['0–10',2],['10–20',5],['20–30',9],['30–40',8],['40–50',4]]
  ],rows=>rows.map(([bin,n],i)=>rect(50+i*70,163-n*10,70,n*10,i%2?green:'#55876e')+label(85+i*70,157-n*10,n)+label(85+i*70,182,bin)).join('')+label(225,203,'Delivery duration (minutes)'));
  const routes = [
    [['A',2,4,8],['B',3,7,20],['C',5,5,14],['D',6,12,30],['E',8,14,36]],
    [['A',2,5,14],['B',3,4,12],['C',5,8,22],['D',6,10,24],['E',8,12,18]]
  ];
  function routesPlot(rows,bubble) {
    let result = line(55,18,55,161)+line(55,161,409,161);
    for(const t of [0,5,10,15]) result+=label(48,165-t*8,t,'end')+line(55,161-t*8,408,161-t*8,'#cddad5');
    for(const t of [0,2,4,6,8]) result+=label(55+t*40,179,t);
    return result+rows.map(([n,km,delay,volume])=>{
      const x=55+40*km,y=161-delay*8,r=bubble?Math.sqrt(volume)*2.4:4;
      return dot(x,y,r,blue)+label(x+r+3,y+4,n,'start');
    }).join('')+label(55,13,'Delay (min)','start')+label(225,203,bubble?'Distance (km) · Circle area measures orders':'Distance (km)');
  }
  register('Scatter plot','Distance and delay by route',['Route','Distance (km)','Delay (min)'],routes.map(rs=>rs.map(r=>r.slice(0,3))),r=>routesPlot(r,false));
  register('Bubble chart','Distance, delay and order volume',['Route','Distance (km)','Delay (min)','Orders'],routes,r=>routesPlot(r,true));
  register('Box plot','Delivery duration by shift',['Shift','Minimum','Q1','Median','Q3','Maximum'],[
    [['Day',8,14,18,26,38],['Night',12,21,28,35,47]],
    [['Day',6,12,19,24,37],['Night',10,18,23,34,43]]
  ],rows=>{
    const x=v=>67+v*7;
    return rows.map(([s,min,q1,median,q3,max],i)=>{
      const y=58+i*64;
      return label(62,y+4,s,'end')+line(x(min),y,x(max),y)+line(x(min),y-9,x(min),y+9)+line(x(max),y-9,x(max),y+9)+rect(x(q1),y-15,x(q3)-x(q1),30,'#abd0bf')+line(x(median),y-15,x(median),y+15,ink,3);
    }).join('')+line(67,160,417,160)+[0,10,20,30,40,50].map(v=>label(x(v),178,v)).join('')+label(225,202,'Delivery duration (minutes)');
  });
  register('Heatmap','Orders by shift and day',['Shift','Mon','Tue','Wed','Thu','Fri'],[
    [['Morning',8,12,4,16,9],['Evening',15,18,10,7,13]],
    [['Morning',12,8,5,14,10],['Evening',9,13,16,11,18]]
  ],rows=>['Mon','Tue','Wed','Thu','Fri'].map((d,i)=>label(105+i*62,36,d)).join('')+rows.map(([shift,...values],i)=>label(68,77+i*55,shift,'end')+values.map((v,j)=>rect(76+j*62,49+i*55,58,49,'hsl(151,32%,'+(97-v*2.8)+'%)')+label(105+j*62,78+i*55,v,'middle',v>15?'white':ink)).join('')).join('')+label(225,188,'Darker cells indicate more orders'));
  register('Waterfall chart','Order backlog reconciliation',['Step','Order count','Meaning'],[
    [['Opening',24,'Balance'],['New',16,'Increase'],['Shipped',-12,'Decrease'],['Cancelled',-3,'Decrease'],['Closing',25,'Balance']],
    [['Opening',30,'Balance'],['New',12,'Increase'],['Shipped',-18,'Decrease'],['Cancelled',-4,'Decrease'],['Closing',20,'Balance']]
  ],rows=>{
    let balance=0;
    const y=v=>171-v*3.2;
    return rows.map(([s,v,type],i)=>{
      const x=20+i*85,start=type==='Balance'?0:balance;
      balance=start+v;
      return rect(x,y(Math.max(start,balance)),49,Math.abs(v)*3.2,type==='Balance'?blue:v>0?green:gold)+label(x+24,y(Math.max(start,balance))-6,v>0&&type==='Increase'?'+'+v:v)+label(x+24,190,s)+(i<rows.length-1?line(x+49,y(balance),x+85,y(balance)): '');
    }).join('');
  });
  register('Bullet chart','Fulfilment against the weekly target',['Team','Orders','Target','Fair up to','Good up to','Scale maximum'],[
    [['North',72,85,40,70,100],['South',88,80,40,70,100]],
    [['North',66,80,40,70,100],['South',75,82,40,70,100]]
  ],rows=>rows.map(([s,v,target,a,b,max],i)=>{
    const x=75,y=42+i*65,k=3.25;
    return label(68,y+20,s,'end')+rect(x,y,max*k,34,'#aec5b8')+rect(x,y,b*k,34,'#d0ded5')+rect(x,y,a*k,34,'#e9efea')+rect(x,y+11,v*k,12,ink)+line(x+target*k,y-3,x+target*k,y+37,gold,4);
  }).join('')+label(225,168,'Orders on a 0–100 scale · Vertical tick marks target')+label(225,190,'Background bands end at 40, 70 and 100 orders'));
  register('Treemap','Orders by region and service',['Region','Standard','Express'],orders,rows=>{
    let x=5;
    const total=rows.reduce((sum,[,a,b])=>sum+a+b,0);
    return rows.map(([s,a,b],i)=>{
      const w=(a+b)/total*440,h=a/(a+b)*150;
      const marks=label(x+w/2,26,s)+rect(x,38,w,h,colors[i])+rect(x,38+h,w,150-h,colors[i])+line(x,38+h,x+w,38+h,'white',2)+line(x,38,x,188,'white',3)+label(x+w/2,42+h/2,'Standard '+a,'middle','white')+label(x+w/2,42+h+(150-h)/2,'Express '+b,'middle','white');
      x+=w;
      return marks;
    }).join('');
  });
  const nodes = [['Gateway',65,102],['Orders',219,53],['Tracking',219,155],['Storage',382,102]];
  function arrow(x1,y1,x2,y2,color=ink) {
    const a=Math.atan2(y2-y1,x2-x1), head=8;
    const wing=offset=>(x2-head*Math.cos(a+offset))+' '+(y2-head*Math.sin(a+offset));
    return line(x1,y1,x2,y2,color,2)+path('M'+wing(.52)+' L'+x2+' '+y2+' L'+wing(-.52)+' Z',color);
  }
  const edges = [
    [['Gateway','Orders'],['Gateway','Tracking'],['Orders','Storage'],['Tracking','Storage']],
    [['Gateway','Orders'],['Orders','Tracking'],['Orders','Storage'],['Tracking','Storage']]
  ];
  register('Network graph','Downstream service dependencies',['Calling service','Called service'],edges,(rows,selected)=>{
    const connections=rows.map(([from,to])=>{
      const [,x1,y1]=nodes.find(n=>n[0]===from),[,x2,y2]=nodes.find(n=>n[0]===to);
      const dx=x2-x1,dy=y2-y1;
      const inset=Math.min(dx===0?Infinity:43/Math.abs(dx),dy===0?Infinity:17/Math.abs(dy));
      return arrow(x1+dx*inset,y1+dy*inset,x2-dx*inset,y2-dy*inset,from===selected?gold:ink);
    }).join('');
    return connections+nodes.map(([s,x,y])=>rect(x-42,y-16,84,32,s===selected?gold:green)+label(x,y+4,s,'middle','white')).join('');
  },true);
  register('Tree diagram','Delivery team reporting lines',['Parent','Team'],[
    [['Operations','North'],['Operations','South'],['North','Intake'],['North','Dispatch'],['South','Returns']],
    [['Operations','North'],['Operations','South'],['North','Intake'],['South','Dispatch'],['South','Returns']]
  ],rows=>{
    const pos={Operations:[225,23],North:[130,92],South:[325,92],Intake:[68,172],Dispatch:[220,172],Returns:[380,172]};
    const links=rows.map(([parent,child])=>{
      const [x,y]=pos[parent],[cx,cy]=pos[child],mid=(y+cy)/2;
      return path('M'+x+' '+y+' V'+mid+' H'+cx+' V'+cy,'none',ink,2);
    }).join('');
    return links+Object.entries(pos).map(([s,[x,y]])=>rect(x-44,y-14,88,29,green)+label(x,y+4,s,'middle','white')).join('');
  });
  register('Flowchart','Package inspection workflow',['Step','Outcome','Next step'],[
    [['Inspect','Continue','Damaged?'],['Damaged?','Yes','Review'],['Damaged?','No','Ship']],
    [['Inspect','Continue','Fragile?'],['Fragile?','Yes','Wrap'],['Fragile?','No','Ship']]
  ],rows=>rect(176,5,98,32,green)+label(225,26,rows[0][0],'middle','white')+arrow(225,37,225,59)+path('M225 59 L291 99 L225 139 L159 99 Z','#d4e5d9',ink,2)+label(225,103,rows[0][2])+line(159,99,90,99)+line(291,99,360,99)+arrow(90,99,90,155)+arrow(360,99,360,155)+label(122,92,rows[1][1])+label(327,92,rows[2][1])+rect(40,155,100,34,blue)+label(90,177,rows[1][2],'middle','white')+rect(310,155,100,34,blue)+label(360,177,rows[2][2],'middle','white'));
  register('Sankey diagram','Requests from channels to services',['Channel','Service','Requests'],[
    [['Web','Orders',42],['Web','Tracking',18],['App','Orders',18],['App','Tracking',22]],
    [['Web','Orders',24],['Web','Tracking',16],['App','Orders',28],['App','Tracking',32]]
  ],rows=>{
    const channels=['Web','App'],services=['Orders','Tracking'];
    function side(names,col,x) {
      let top=18,marks='';
      const offsets={};
      for(const name of names){
        const count=rows.filter(r=>r[col]===name).reduce((s,r)=>s+r[2],0);
        offsets[name]=top;
        marks+=rect(x,top,8,count*1.4,ink)+label(col===0?x-4:x+12,top+count*.7+4,name,col===0?'end':'start');
        top+=count*1.4+22;
      }
      return {offsets,marks};
    }
    const left=side(channels,0,67),right=side(services,1,356);
    const ribbons=rows.map(([from,to,count])=>{
      const a=left.offsets[from],b=right.offsets[to],h=count*1.4;
      left.offsets[from]+=h;
      right.offsets[to]+=h;
      return path('M75 '+a+' C210 '+a+' 217 '+b+' 356 '+b+' v'+h+' C217 '+(b+h)+' 210 '+(a+h)+' 75 '+(a+h)+' Z',from==='Web'?'#729e88':'#8eabc3','#fff',1);
    }).join('');
    return ribbons+left.marks+right.marks+label(225,204,'Channel → Service · Band width measures requests');
  });
  register('Gantt chart','Warehouse rollout schedule',['Task','First day','Last day (inclusive)'],[
    [['Survey',1,2],['Install',3,5],['Train',4,6],['Launch',7,7]],
    [['Survey',1,3],['Install',4,5],['Train',5,7],['Launch',7,7]]
  ],rows=>Array.from({length:7},(_,i)=>label(114+i*46,28,'Day '+(i+1))+line(91+i*46,36,91+i*46,191,'#ccdad0')).join('')+rows.map(([s,start,end],i)=>label(84,65+i*37,s,'end')+rect(91+(start-1)*46,48+i*37,(end-start+1)*46,24,colors[i])).join(''));
  const regions=[
    ['North','M45 30 L180 18 L211 72 L150 105 L50 84 Z',115,61],
    ['East','M180 18 L310 39 L328 111 L253 135 L211 72 Z',265,79],
    ['West','M50 84 L150 105 L169 162 L90 181 L35 135 Z',102,132],
    ['South','M150 105 L211 72 L253 135 L328 111 L302 177 L169 162 Z',229,131]
  ];
  const spatial=[
    [['North',120,6],['East',84,12],['West',60,4],['South',150,8]],
    [['North',90,8],['East',110,4],['West',40,10],['South',130,6]]
  ];
  function map(rows,symbols) {
    const boundaries=regions.map(([,d],i)=>path(d,symbols?'#e4ebe8':'hsl(153,34%,'+(96-rows[i][1]*4)+'%)','#fff',2)).join('');
    return boundaries+regions.map(([s,,x,y],i)=>{
      const v=rows[i][1];
      return symbols?dot(x,y-8,Math.sqrt(v)*1.9,blue)+label(x,y-4,v,'middle','white')+label(x,y+25,s):label(x,y,s)+label(x,y+16,v+'%');
    }).join('')+label(220,203,symbols?'Dispatch hubs · Circle area measures orders':'Delivery districts · Darker shading means a higher late rate');
  }
  register('Choropleth map','Late deliveries by district',['District','Late deliveries (%)'],spatial.map(rs=>rs.map(([name,,rate])=>[name,rate])),r=>map(r,false));
  register('Proportional symbol map','Order volume at dispatch hubs',['Hub','Orders'],spatial.map(rs=>rs.map(([name,orders])=>[name,orders])),r=>map(r,true));
})();
