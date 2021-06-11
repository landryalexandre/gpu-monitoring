var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'gpu-monitoring',
  description: 'gpu-monitoring',
  script: 'C:\\Users\\landr\\Desktop\\workdir\\gpu-monitoring\\index.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();