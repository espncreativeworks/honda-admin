Date.prototype.getWeek=function(a){a="int"==typeof a?a:0;var b=new Date(this.getFullYear(),0,1),c=b.getDay()-a;c=c>=0?c:c+7;var d,e=Math.floor((this.getTime()-b.getTime()-6e4*(this.getTimezoneOffset()-b.getTimezoneOffset()))/864e5)+1;return 4>c?(d=Math.floor((e+c-1)/7)+1,d>52&&(nYear=new Date(this.getFullYear()+1,0,1),nday=nYear.getDay()-a,nday=nday>=0?nday:nday+7,d=4>nday?1:53)):d=Math.floor((e+c-1)/7),d},angular.module("hondaAdminApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","google-maps","frapontillo.bootstrap-switch"]).config(["$routeProvider","$locationProvider","$httpProvider","$sceDelegateProvider",function(a,b,c,d){a.when("/",{templateUrl:"partials/main",controller:"MainCtrl"}).when("/login",{templateUrl:"partials/login",controller:"LoginCtrl"}).when("/signup",{templateUrl:"partials/signup",controller:"SignupCtrl"}).when("/settings",{templateUrl:"partials/settings",controller:"SettingsCtrl",authenticate:!0}).when("/uploads",{templateUrl:"partials/upload-list",controller:"UploadListCtrl",authenticate:!0}).when("/uploads/stats",{templateUrl:"partials/upload-stats",controller:"UploadStats",authenticate:!0}).when("/uploads/user/:userId",{templateUrl:"partials/upload-list-by-user",controller:"UploadListByUserCtrl",authenticate:!0}).when("/uploads/:fileId",{templateUrl:"partials/upload-detail",controller:"UploadDetailCtrl",authenticate:!0}).otherwise({redirectTo:"/"}),b.html5Mode(!0),c.interceptors.push(["$q","$location",function(a,b){return{responseError:function(c){return 401===c.status?(b.path("/login"),a.reject(c)):a.reject(c)}}}]),d.resourceUrlWhitelist(["self","http://d2mrf83medbxq6.cloudfront.net/**","https://d2mrf83medbxq6.cloudfront.net/**"])}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$routeChangeStart",function(a,d){d.authenticate&&!c.isLoggedIn()&&b.path("/login")})}]),angular.module("hondaAdminApp").controller("MainCtrl",["$scope","$http",function(a,b){b.get("/api/uploads/featured").success(function(b){a.uploads=b.results})}]),angular.module("hondaAdminApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){a.menu=[{title:"Uploads",link:"/uploads"},{title:"Stats",link:"/uploads/stats"},{title:"Settings",link:"/settings"}],a.logout=function(){c.logout().then(function(){b.path("/login")})},a.isActive=function(a){return a===b.path()}}]),angular.module("hondaAdminApp").controller("LoginCtrl",["$scope","Auth","$location",function(a,b,c){a.user={},a.errors={},a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/")}).catch(function(b){b=b.data,a.errors.other=b.message})}}]),angular.module("hondaAdminApp").controller("SignupCtrl",["$scope","Auth","$location",function(a,b,c){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password}).then(function(){c.path("/")}).catch(function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})}}]),angular.module("hondaAdminApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="Password successfully changed."}).catch(function(){b.password.$setValidity("mongoose",!1),a.errors.other="Incorrect password"})}}]);var app=angular.module("hondaAdminApp");app.controller("UploadListCtrl",["$scope","$http","$location",function(a,b,c){var d="/api/uploads",e=c.search();d+=e.page?"?page="+e.page:"?page=1",d+=e.rpp?"&rpp="+e.rpp:"&rpp=10",d+=e.duration?"&duration="+e.duration:"&duration=30",d+=e.sd?"&sd="+e.sd:"&sd=1401681600000",d+=e.ed?"&ed="+e.ed:"&ed=1405396800000",b.get(d).success(function(b){a.page=b.page,a.rpp=b.rpp,a.uploads=b.results,a.duration=e.duration||30,a.startDate=e.sd||new Date(14016816e5).valueOf(),a.endDate=e.ed||new Date(14053968e5).valueOf()}),a.next=function(){var a,b=parseInt(e.page,10);a=b?b+1:2,c.search("page",a)},a.prev=function(){var a,b=parseInt(e.page,10);a=b&&b>1?b-1:1,c.search("page",a)},a.updateRpp=function(a){c.search("rpp",a)}}]),app.controller("UploadListByUserCtrl",["$scope","$http","$routeParams","$location",function(a,b,c,d){var e="/api/uploads/user/"+c.userId,f=d.search();e+=f.page?"?page="+f.page:"?page=1",e+=c.rpp?"&rpp="+f.rpp:"&rpp=10",b.get(e).success(function(b){a.page=b.page,a.rpp=b.rpp,a.uploads=b.results}),a.next=function(){var a,b=parseInt(f.page,10);a=b?b+1:2,d.search("page",a)},a.prev=function(){var a,b=parseInt(f.page,10);a=b&&b>1?b-1:1,d.search("page",a)},a.updateRpp=function(a){d.search("rpp",a)}}]),app.controller("UploadDetailCtrl",["$scope","$http","$routeParams","$log",function(a,b,c,d){b.get("/api/uploads/"+c.fileId).success(function(b){a.upload=b,a.isSelected=a.upload.active,b.loc[0]&&b.loc[1]&&(a.map={center:{latitude:b.loc[1],longitude:b.loc[0]},zoom:16,pan:!0,draggable:!0,refresh:!0,options:{streetViewControl:!1,panControl:!0,maxZoom:20,minZoom:14}},d.info(a.map))}),a.onText="Visible",a.offText="Hidden",a.isActive=!0,a.size="large",a.animate=!0,a.$watch("isSelected",function(){d.info("$scope.isSelected = ",a.isSelected),a.upload.active!==a.isSelected&&b.post("/api/uploads/"+c.fileId+"/active").success(function(b){a.upload.active=b.active,a.isSelected=b.active})}),a.toggleFeatured=function(c){b.post("/api/uploads/"+c.uploadId+"/featured").success(function(b){a.upload.featured=b.featured})}}]),app.controller("UploadStats",["$scope","$http","$log",function(a,b){b.get("/api/uploads/stats").success(function(b){var c=new Date,d=c.getUTCFullYear(),e=c.getUTCMonth()+1,f=c.getWeek()-1,g=c.getUTCDate();a.stats=b.results,a.daily=0,a.weekly=0,a.monthly=0,a.yearly=0,a.total=0,a.chartData=[],a.renderers=["line","bar","area"],a.renderer="area",a.stats.forEach(function(b){a.total+=b.count,a.chartData.push({x:new Date(b._id.y,b._id.m-1,b._id.d).getTime()/1e3,y:b.count}),b._id.y===d&&(a.yearly+=b.count,b._id.m===e&&(a.monthly+=b.count,b._id.d===g&&(a.daily+=b.count)),b._id.w===f&&(a.weekly+=b.count))}),a.chartData.sort(function(a,b){return a.x-b.x})})}]);var app=angular.module("hondaAdminApp");app.controller("DatePickerCtrlStart",["$scope","$http","$location","$log",function(a,b,c,d){var e=c.search();a.today=function(){a.dt=new Date},a.clear=function(){a.dt=null},a.open=function(b){b.preventDefault(),b.stopPropagation(),a.opened=!0},a.startAt=function(b){d.info("Start date: ",b),b&&(c.search("sd",b.valueOf()),a.dt=b)},a.dateOptions={formatYear:"yy",startingDay:1},a.initDate=new Date(parseInt(e.sd,10)||14016816e5),a.dt=a.initDate,a.minDate=new Date(14016816e5),a.maxDate=new Date(14053968e5),a.formats=["MM/dd/yyyy","yyyy/MM/dd","dd.MM.yyyy","shortDate"],a.format=a.formats[0],a.showWeeks=!1}]),app.controller("DatePickerCtrlEnd",["$scope","$http","$location","$log",function(a,b,c,d){var e=c.search();a.today=function(){a.dt=new Date},a.clear=function(){a.dt=null},a.open=function(b){b.preventDefault(),b.stopPropagation(),a.opened=!0},a.endAt=function(b){d.info("End date: ",b),b&&(c.search("ed",b.valueOf()),a.dt=b)},a.dateOptions={formatYear:"yy",startingDay:1},a.initDate=new Date(parseInt(e.ed,10)||14053968e5),a.dt=a.initDate,a.minDate=new Date(14016816e5),a.maxDate=new Date(14053968e5),a.formats=["MM/dd/yyyy","yyyy/MM/dd","dd.MM.yyyy","shortDate"],a.format=a.formats[0],a.showWeeks=!1}]),angular.module("hondaAdminApp").factory("Auth",["$location","$rootScope","Session","User","$cookieStore",function(a,b,c,d,e){return b.currentUser=e.get("user")||null,e.remove("user"),{login:function(a,d){var e=d||angular.noop;return c.save({email:a.email,password:a.password},function(a){return b.currentUser=a,e()},function(a){return e(a)}).$promise},logout:function(a){var d=a||angular.noop;return c.delete(function(){return b.currentUser=null,d()},function(a){return d(a)}).$promise},createUser:function(a,c){var e=c||angular.noop;return d.save(a,function(a){return b.currentUser=a,e(a)},function(a){return e(a)}).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.update({oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},currentUser:function(){return d.get()},isLoggedIn:function(){var a=b.currentUser;return!!a}}}]),angular.module("hondaAdminApp").factory("Session",["$resource",function(a){return a("/api/session/")}]),angular.module("hondaAdminApp").factory("User",["$resource",function(a){return a("/api/users/:id",{id:"@id"},{update:{method:"PUT",params:{}},get:{method:"GET",params:{id:"me"}}})}]),angular.module("hondaAdminApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}});var app=angular.module("hondaAdminApp");app.directive("rickshawChart",function(){return{scope:{data:"=",renderer:"="},template:"<div></div>",restrict:"E",link:function(a,b,c){a.$watchCollection("[data, renderer]",function(d){if(d[0]){b[0].innerHTML="";var e=new Rickshaw.Graph({element:b[0],width:c.width,height:c.height,series:[{name:c.name||"Value",data:a.data,color:c.color}],renderer:a.renderer}),f=new Rickshaw.Graph.Axis.Time({graph:e});f.render();var g=new Rickshaw.Graph.Axis.Y({graph:e});g.render();{new Rickshaw.Graph.HoverDetail({graph:e,formatter:function(a,b,c){var d='<span class="date">'+new Date(1e3*b).toLocaleDateString()+"</span>",e=a.name+": "+parseInt(c)+"<br>"+d;return e}})}e.render()}})}}});