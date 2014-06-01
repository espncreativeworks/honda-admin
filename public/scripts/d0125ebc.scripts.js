"use strict";angular.module("hondaAdminApp",["ngCookies","ngResource","ngSanitize","ngRoute"]).config(["$routeProvider","$locationProvider","$httpProvider",function(a,b,c){a.when("/",{templateUrl:"partials/main",controller:"MainCtrl"}).when("/login",{templateUrl:"partials/login",controller:"LoginCtrl"}).when("/signup",{templateUrl:"partials/signup",controller:"SignupCtrl"}).when("/settings",{templateUrl:"partials/settings",controller:"SettingsCtrl",authenticate:!0}).when("/uploads",{templateUrl:"partials/upload-list",controller:"UploadListCtrl"}).when("/uploads/:fileId",{templateUrl:"partials/upload-detail",controller:"UploadDetailCtrl"}).otherwise({redirectTo:"/"}),b.html5Mode(!0),c.interceptors.push(["$q","$location",function(a,b){return{responseError:function(c){return 401===c.status?(b.path("/login"),a.reject(c)):a.reject(c)}}}])}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$routeChangeStart",function(a,d){d.authenticate&&!c.isLoggedIn()&&b.path("/login")})}]),angular.module("hondaAdminApp").controller("MainCtrl",["$scope","$http",function(a,b){b.get("/api/awesomeThings").success(function(b){a.awesomeThings=b})}]),angular.module("hondaAdminApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){a.menu=[{title:"Home",link:"/"},{title:"Uploads",link:"/uploads"},{title:"Settings",link:"/settings"}],a.logout=function(){c.logout().then(function(){b.path("/login")})},a.isActive=function(a){return a===b.path()}}]),angular.module("hondaAdminApp").controller("LoginCtrl",["$scope","Auth","$location",function(a,b,c){a.user={},a.errors={},a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/")}).catch(function(b){b=b.data,a.errors.other=b.message})}}]),angular.module("hondaAdminApp").controller("SignupCtrl",["$scope","Auth","$location",function(a,b,c){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password}).then(function(){c.path("/")}).catch(function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})}}]),angular.module("hondaAdminApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="Password successfully changed."}).catch(function(){b.password.$setValidity("mongoose",!1),a.errors.other="Incorrect password"})}}]),angular.module("hondaAdminApp").factory("Auth",["$location","$rootScope","Session","User","$cookieStore",function(a,b,c,d,e){return b.currentUser=e.get("user")||null,e.remove("user"),{login:function(a,d){var e=d||angular.noop;return c.save({email:a.email,password:a.password},function(a){return b.currentUser=a,e()},function(a){return e(a)}).$promise},logout:function(a){var d=a||angular.noop;return c.delete(function(){return b.currentUser=null,d()},function(a){return d(a)}).$promise},createUser:function(a,c){var e=c||angular.noop;return d.save(a,function(a){return b.currentUser=a,e(a)},function(a){return e(a)}).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.update({oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},currentUser:function(){return d.get()},isLoggedIn:function(){var a=b.currentUser;return!!a}}}]),angular.module("hondaAdminApp").factory("Session",["$resource",function(a){return a("/api/session/")}]),angular.module("hondaAdminApp").factory("User",["$resource",function(a){return a("/api/users/:id",{id:"@id"},{update:{method:"PUT",params:{}},get:{method:"GET",params:{id:"me"}}})}]),angular.module("hondaAdminApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}});var app=angular.module("hondaAdminApp");app.controller("UploadListCtrl",["$scope","$http",function(a,b){b.get("/api/uploads").success(function(b){a.uploads=b})}]),app.controller("UploadDetailCtrl",["$scope","$http","$routeParams",function(a,b,c){b.get("/api/uploads/"+c.fileId).success(function(b){a.upload=b})}]);