import http from 'node:http';
const products=[{id:'fern',name:'Silver fern',price:1200},{id:'quartz',name:'River quartz',price:800}];
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');let status=200;let value;
 try{
  if(url.pathname==='/'||url.pathname==='/health')value={ok:true,service:'rest',release:2};
  else if(url.pathname==='/products')value={products};
  else if(url.pathname==='/large'){const n=Math.min(1100000,Math.max(0,Number(url.searchParams.get('size')||131072)));value={bytes:n,payload:'x'.repeat(n)}}
  else if(url.pathname==='/headers')value={cookieBytes:(req.headers.cookie||'').length,probeBytes:(req.headers['x-probe']||'').length};
  else if(url.pathname==='/slow'){await new Promise(r=>setTimeout(r,1500));value={ok:true,waitMs:1500};}
  else if(url.pathname==='/fail'){status=500;value={error:'intentional test failure'};}
  else if(url.pathname==='/orders'&&req.method==='POST'){
   let raw='';for await(const c of req)raw+=c;let b;try{b=JSON.parse(raw)}catch{status=400;value={error:'invalid JSON'}}
   if(b){if(!b.product||!Number.isInteger(b.quantity)||b.quantity<1){status=422;value={error:'product and positive quantity required'}}else{status=201;value={id:'order-demo',...b,total:b.quantity*1200};}}
  }else{status=404;value={error:'not found'};}
 }catch(e){status=500;value={error:e.message};}
 console.info('ship-rest',req.method,url.pathname,status);
 res.writeHead(status,{'content-type':'application/json','x-ship-release':'2'});res.end(JSON.stringify(value));
});server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.info('ship-rest listening'));
