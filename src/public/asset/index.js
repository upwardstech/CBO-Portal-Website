'use strict';

var auth_url = "https://auth.cbo.upward.st/api/";
var api_url = "https://api.cbo.upward.st/";

var globalConfig = {
    client_id: 'cbo_client_demo',
    client_secret: '7e98a24f4fe91535348f6e87cde866dca9134b50fc029abefdc7278369f2',
    response_type: 'code',
    grant_type: 'password'
};

var app = angular.module('CboPortal', ['ngRoute', 'ngCookies', 'ngPrettyJson', 'ui.date', 'anguFixedHeaderTable', 'scrollable-table']);

app.config(['$httpProvider', function ($httpProvider) {
    //Reset headers to avoid OPTIONS request (aka preflight)
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.get = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.common['Accept'] = '*/*';

}]);

app.config(function ($routeProvider) {

    $routeProvider.
        when('/', {
            templateUrl: 'asset/templates/student/list.html',
            controller: 'StudentController',
            access: { requiredAuthentication: true }
        }).
        when('/student/add', {
            templateUrl: 'asset/templates/student/add.html',
            controller: 'StudentAddController',
            access: { requiredAuthentication: true }
        }).
        when('/student/backpacks/:student_id', {
            templateUrl: 'asset/templates/student/backpacks.html',
            controller: 'StudentBackpackController',
            access: { requiredAuthentication: true }
        }).
        when('/student/detail/:student_id', {
            templateUrl: 'asset/templates/student/detail.html',
            controller: 'StudentDetailController',
            access: { requiredAuthentication: true }
        }).
        when('/student/edit/:student_id', {
            templateUrl: 'asset/templates/student/edit.html',
            controller: 'StudentEditController',
            access: { requiredAuthentication: true }
        }).
        when('/student/programs/:student_id/add', {
            templateUrl: 'asset/templates/student/program_add.html',
            controller: 'StudentProgramAddController',
            access: { requiredAuthentication: true }
        }).
        when('/student/programs/:student_id', {
            templateUrl: 'asset/templates/student/program_list.html',
            controller: 'StudentProgramController',
            access: { requiredAuthentication: true }
        }).
        when('/student', {
            templateUrl: 'asset/templates/student/list.html',
            controller: 'StudentController',
            access: { requiredAuthentication: true }
        }).
        when('/profile/edit', {
            templateUrl: 'asset/templates/profile/edit.html',
            controller: 'ProfileEditController',
            access: { requiredAuthentication: true }
        }).
        when('/profile', {
            templateUrl: 'asset/templates/profile/detail.html',
            controller: 'ProfileController',
            access: { requiredAuthentication: true }
        }).
        when('/program/add', {
            templateUrl: 'asset/templates/program/add.html',
            controller: 'ProgramAddController',
            access: { requiredAuthentication: true }
        }).
        when('/program/detail/:program_id', {
            templateUrl: 'asset/templates/program/detail.html',
            controller: 'ProgramDetailController',
            access: { requiredAuthentication: true }
        }).
        when('/program/edit/:program_id', {
            templateUrl: 'asset/templates/program/edit.html',
            controller: 'ProgramEditController',
            access: { requiredAuthentication: true }
        }).
        when('/program/students/:program_id/add', {
            templateUrl: 'asset/templates/program/student_add.html',
            controller: 'ProgramStudentAddController',
            access: { requiredAuthentication: true }
        }).
		when('/program/students/:program_id/edit/:student_id', {
            templateUrl: 'asset/templates/program/student_edit.html',
            controller: 'ProgramStudentEditController',
            access: { requiredAuthentication: true }
        }).
        when('/program/students/:program_id', {
            templateUrl: 'asset/templates/program/student_list.html',
            controller: 'ProgramStudentController',
            access: { requiredAuthentication: true }
        }).
        when('/program', {
            templateUrl: 'asset/templates/program/list.html',
            controller: 'ProgramController',
            access: { requiredAuthentication: true }
        }).
        when('/user/invite', {
            templateUrl: 'asset/templates/user/invite.html',
            controller: 'UserInviteController',
            access: { requiredAuthentication: true, requiredAdmin: true }
        }).
        when('/user/group/:user_id/add', {
            templateUrl: 'asset/templates/user/group_add.html',
            controller: 'UserGroupAddController',
            access: { requiredAuthentication: true, requiredAdmin: true }
        }).
        when('/user/group/:user_id', {
            templateUrl: 'asset/templates/user/group.html',
            controller: 'UserGroupController',
            access: { requiredAuthentication: true, requiredAdmin: true }
        }).
        when('/user/edit/:user_id', {
            templateUrl: 'asset/templates/user/edit.html',
            controller: 'UserEditController',
            access: { requiredAuthentication: true, requiredAdmin: true }
        }).
        when('/user/detail/:user_id', {
            templateUrl: 'asset/templates/user/detail.html',
            controller: 'UserDetailController',
            access: { requiredAuthentication: true }
        }).
        when('/user', {
            templateUrl: 'asset/templates/user/list.html',
            controller: 'UserController',
            access: { requiredAuthentication: true }
        }).
        when('/heartbeat', {
            templateUrl: 'asset/templates/heartbeat/list.html',
            controller: 'HeartbeatController',
            access: { requiredAuthentication: true }
        }).
        when('/login', {
            templateUrl: 'asset/templates/login.html',
            controller: 'LoginController'
        }).
        when('/forget', {
            templateUrl: 'asset/templates/forget.html',
            controller: 'LoginController'
        }).
        otherwise({
            redirectTo: '/'
        });

});

app.run(['$window', '$rootScope', 
function ($window ,  $rootScope) {
  $rootScope.goBack = function(){
    $window.history.back();
  }
}]);


app.run(function($rootScope, $http, $location, $window, AuthenticationService, CookieStore) {

    CookieStore.getData();

    $rootScope.$on("$routeChangeStart", function(event, nextRoute) {
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
            $location.path("/login");
        }
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAdmin && AuthenticationService.role == 'case-worker') {
            showError("You don't have any permission to access this page", 1);
            event.preventDefault();
        }
    });
});


app.factory('AuthenticationService', function()
{
    var auth = {
        isAuthenticated: false,
        token: null,
        organization_id: null,
        redirect_url: null,
        user_id: null,
        email: null,
        name: null,
        role: null,
        keep_email: false
    };

    return auth;

});

app.factory('CookieStore', function ($rootScope, $window, $cookieStore, AuthenticationService)
{
    return {
        put: function(name, value)
        {
            $cookieStore.put(name, value);
        },
        get: function(name)
        {
            return $cookieStore.get(name);
        },
        put_remember: function(value)
        {
            $cookieStore.put('cboAdmin_cookie_remember', value);
        },
        setData: function(token, organization_id, redirect_url, user_id, email, name, role) {
            $cookieStore.put('cboAdmin_cookie_token', token);
            $cookieStore.put('cboAdmin_cookie_organization_id', organization_id);
            $cookieStore.put('cboAdmin_cookie_redirect_url', redirect_url);
            $cookieStore.put('cboAdmin_cookie_user_id', user_id);
            $cookieStore.put('cboAdmin_cookie_email', email);
            $cookieStore.put('cboAdmin_cookie_name', name);
            $cookieStore.put('cboAdmin_cookie_role', role);

            AuthenticationService.isAuthenticated = true;
            AuthenticationService.token = $cookieStore.get('cboAdmin_cookie_token');
            AuthenticationService.organization_id = $cookieStore.get('cboAdmin_cookie_organization_id');
            AuthenticationService.redirect_url = $cookieStore.get('cboAdmin_cookie_redirect_url');
            AuthenticationService.user_id = $cookieStore.get('cboAdmin_cookie_user_id');
            AuthenticationService.email = $cookieStore.get('cboAdmin_cookie_email');
            AuthenticationService.name = $cookieStore.get('cboAdmin_cookie_name');
            AuthenticationService.role = $cookieStore.get('cboAdmin_cookie_role');
            $rootScope.showNavBar = true;
            $rootScope.completeName = AuthenticationService.name;

        },
        getData: function() {
            if( typeof $cookieStore.get('cboAdmin_cookie_token') !== 'undefined' && $cookieStore.get('cboAdmin_cookie_token') && typeof $cookieStore.get('cboAdmin_cookie_organization_id') !== 'undefined' && $cookieStore.get('cboAdmin_cookie_organization_id') )
            {
                AuthenticationService.isAuthenticated = true;
                AuthenticationService.token = $cookieStore.get('cboAdmin_cookie_token');
                AuthenticationService.organization_id = $cookieStore.get('cboAdmin_cookie_organization_id');
                AuthenticationService.redirect_url = $cookieStore.get('cboAdmin_cookie_redirect_url');
                AuthenticationService.user_id = $cookieStore.get('cboAdmin_cookie_user_id');
                AuthenticationService.email = $cookieStore.get('cboAdmin_cookie_email');
                AuthenticationService.name = $cookieStore.get('cboAdmin_cookie_name');
                AuthenticationService.role = $cookieStore.get('cboAdmin_cookie_role');
                $rootScope.showNavBar = true;
                $rootScope.completeName = AuthenticationService.name;
                return true;
            }
            else
            {
                var remember = $cookieStore.get('cboAdmin_cookie_remember');
                if(remember == true)
                {

                }
                else
                {
                    AuthenticationService.email = null;
                }

                AuthenticationService.isAuthenticated = false;
                AuthenticationService.token = null;
                AuthenticationService.organization_id = null;
                AuthenticationService.redirect_url = null;
                AuthenticationService.user_id = null;
                AuthenticationService.name = null;
                AuthenticationService.role = null;
                $rootScope.showNavBar = false;
                $rootScope.completeName = false;
                return false;
            }
        },
        clearData: function() {

            var remember = $cookieStore.get('cboAdmin_cookie_remember');
            if(remember == true)
            {

            }
            else
            {
                $cookieStore.remove('cboAdmin_cookie_email');
                AuthenticationService.email = null;
            }

            $cookieStore.remove('cboAdmin_cookie_token');
            $cookieStore.remove('cboAdmin_cookie_organization_id');
            $cookieStore.remove('cboAdmin_cookie_redirect_url');
            $cookieStore.remove('cboAdmin_cookie_user_id');
            $cookieStore.remove('cboAdmin_cookie_name');
            $cookieStore.remove('cboAdmin_cookie_role');
            AuthenticationService.isAuthenticated = false;
            AuthenticationService.token = null;
            AuthenticationService.organization_id = null;
            AuthenticationService.redirect_url = null;
            AuthenticationService.user_id = null;
            AuthenticationService.name = null;
            AuthenticationService.role = null;
            $rootScope.showNavBar = false;
            $rootScope.completeName = false;
            return true;
        }
    };
});



app.controller('BodyController', ['$rootScope', '$scope', '$http', '$location', 'CookieStore', 'AuthenticationService',
    function ($rootScope, $scope, $http, $location, CookieStore, AuthenticationService) {

        $rootScope.full_screen = false;
        $scope.isActive = function(route) {

            var route_length = route.length;
            var path = $location.path();
            var new_path = path.substr(0, route_length);
            return route === new_path;

        };

        $scope.logoutMe = function() {

            var logout = {
                token: AuthenticationService.token
            };

            $http.post( auth_url+'logout', $.param(logout), {

            })
                .success( function (response) {

                    CookieStore.clearData();
                    showError('Success Logout', 2);
                    $location.path("/login");

                })
                .error( function (response, status) {

                    console.log(response);
                    console.log(status);

                    CookieStore.clearData();
                    showError('Success Logout', 2);
                    $location.path("/login");

                });

        };

        $rootScope.doingResolve = true;

    }
]);

app.controller('HomeController', ['$rootScope', '$scope',
    function ($rootScope, $scope) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

    }
]);


app.controller('StudentAddController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        $scope.addStudent = function(student)
        {
            if(student)
            {
                $scope.working = true;
                $http.post( api_url+AuthenticationService.organization_id+'/students', $.param(student), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.success == true)
                        {
                            showError(response.message, 2);
							$location.path( '/student' );
                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

    }
]);


app.controller('StudentBackpackController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $scope.student = {};

        var student_id = $routeParams.student_id;

        $http.get( api_url+AuthenticationService.organization_id+'/students/'+student_id+'/xsre', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {
                $scope.student = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('StudentEditController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $scope.student = {};

        var student_id = $routeParams.student_id;

        $scope.editStudent = function(student)
        {
            if(student)
            {
                $scope.working = true;
                $http.put( api_url+AuthenticationService.organization_id+'/students/'+student_id, $.param(student), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.success == true)
                        {
                            showError(response.message, 2);
							$location.path( '/student' );
                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/students/'+student_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.student = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('StudentDetailController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $scope.student = {};
		$scope.programs = [];
		$scope.list_programs = [];
        var student_id = $routeParams.student_id;
		var list_program = [];
		var program_name = '';
		var active_status = '';
		var start_date = '';
		var end_date = '';
		var cohort = '';
		$scope.sch_history =false;
		$scope.academic =true;
		
		$scope.attendance = "col-md-3";
		$scope.attendance_table = false;
		$scope.attendance_expand_btn = true;
		$scope.attendance_close_btn = false;

        $scope.behavior = "col-md-3";
        $scope.behavior_table = false;
        $scope.behavior_expand_btn = true;
        $scope.behavior_close_btn = false;

        $scope.courses = "col-md-3";
        $scope.courses_table = false;
        $scope.courses_expand_btn = true;
        $scope.courses_close_btn = false;

        $scope.program = "col-md-3";
        $scope.program_table = false;
        $scope.program_expand_btn = true;
        $scope.program_close_btn = false;
		
		$scope.expandAttendance = function()
		{
			$scope.attendance = "col-md-6";
			$scope.attendance_table = true;
			$scope.attendance_expand_btn = false;
			$scope.attendance_close_btn = true;
		};
		
		$scope.closeAttendance = function()
		{
			$scope.attendance = "col-md-3";
			$scope.attendance_table = false;
			$scope.attendance_expand_btn = true;
			$scope.attendance_close_btn = false;
		};

        $scope.expandBehavior = function()
        {
            $scope.behavior = "col-md-6";
            $scope.behavior_table = true;
            $scope.behavior_expand_btn = false;
            $scope.behavior_close_btn = true;
        };

        $scope.closeBehavior = function()
        {
            $scope.behavior = "col-md-3";
            $scope.behavior_table = false;
            $scope.behavior_expand_btn = true;
            $scope.behavior_close_btn = false;
        };

        $scope.expandCourses = function()
        {
            $scope.courses = "col-md-6";
            $scope.courses_table = true;
            $scope.courses_expand_btn = false;
            $scope.courses_close_btn = true;
        };

        $scope.closeCourses = function()
        {
            $scope.courses = "col-md-3";
            $scope.courses_table = false;
            $scope.courses_expand_btn = true;
            $scope.courses_close_btn = false;
        };

        $scope.expandProgram = function()
        {
            $scope.program = "col-md-6";
            $scope.program_table = true;
            $scope.program_expand_btn = false;
            $scope.program_close_btn = true;
        };

        $scope.closeProgram = function()
        {
            $scope.program = "col-md-3";
            $scope.program_table = false;
            $scope.program_expand_btn = true;
            $scope.program_close_btn = false;
        };
		
		$scope.showSchoolHistory = function()
		{
			$scope.sch_history =true;
			$scope.academic =false;
		};
		
		$scope.closeSchoolHistory = function()
		{
			$scope.academic = true;
			$scope.sch_history = false;
			
		};
        $http.get( api_url+AuthenticationService.organization_id+'/students/'+student_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {
				console.log(response);
                $scope.student = response;

                var temp_program = [];
                var temp_single_program = '';
                for(var i=0; i<response.programs.length; i++)
                {
                    temp_single_program = response.programs[i];
                    var program_id = temp_single_program.program;
                    if(program_id.toString().length > 0)
                    {
                        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id, {
                            headers: {
                                'Authorization': 'Bearer '+AuthenticationService.token
                            }
                        })
                            .success(function(response_program) {

                                var cohort = temp_single_program.cohort;
                                var temp = {
                                    name: response_program.name,
                                    active: temp_single_program.active,
                                    participation_start_date: temp_single_program.participation_start_date,
                                    participation_end_date: temp_single_program.participation_end_date,
                                    cohort: cohort.join()
                                };

                                temp_program.push(temp);

                            })
                            .error(function(response, status) {

                                console.log(response);
                                console.log(status);
                                showError(response, 1);
                                $rootScope.doingResolve = false;
                                if(status == 401)
                                {
                                    CookieStore.clearData();
                                    $location.path( '/login' );
                                }

                            });
                    }

                    $scope.programs = temp_program;

                }

                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });
			
        $http.get(api_url+AuthenticationService.organization_id+'/students/'+student_id+'/xsre', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {
                console.log(response);
                if(typeof response.success !== 'undefined' && response.success == false)
                {
                    console.log("fail to get");
                }
                else
                {
                    if(typeof response.attendance.summaries !== 'undefined' && response.attendance.summaries)
                    {
                        $scope.daysAttendance = parseInt(response.attendance.summaries.summary.daysInAttendance);
                        $scope.daysAbsent = parseInt(response.attendance.summaries.summary.daysAbsent);
                    }

                    $scope.studentdetails = response;
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });
						
						
    }
]).filter('flattenRows', function() {
    return function(transcriptTerm) {
        var flatten = [];
        var subrows ="";
        angular.forEach(transcriptTerm, function(row) {
            subrows = row.courses.course;
            flatten.push(row);
            if (subrows) {
                angular.forEach(subrows, function(subrow) {
                    flatten.push(angular.extend(subrow, {subrow: true}));
                });
            }
        });
        return flatten;

    }
});


app.controller('ProfileEditController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;
		
        $scope.editProfile = function(user)
        {
            if(user)
            {
                $scope.working = true;
                $http.put( api_url+AuthenticationService.organization_id+'/users/'+AuthenticationService.user_id, $.param(user), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.success == true)
                        {
                            showError(response.message, 2);
                            var complete_name = '';
                            if(typeof user.first_name !== 'undefined' && user.first_name)
                            {
                                complete_name += user.first_name+' ';
                            }
                            if(typeof user.last_name !== 'undefined' && user.last_name)
                            {
                                complete_name += user.last_name;
                            }

                            $rootScope.completeName = complete_name;
                            $location.path( '/profile' );

                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/users/'+AuthenticationService.user_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.user = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('ProfileController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;
		$rootScope.editable = false;
		
		$scope.activateEditable = function(){
			$rootScope.editable = true;
		};
		
        $http.get( api_url+AuthenticationService.organization_id+'/users/'+AuthenticationService.user_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {
                $scope.user = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });
			
			$scope.editProfile = function(user)
        {
            if(user)
            {
                $scope.working = true;
                $http.put( api_url+AuthenticationService.organization_id+'/users/'+AuthenticationService.user_id, $.param(user), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.success == true)
                        {
							$scope.working = false;
							$location.path( '/profile' );
							console.log("Successfully updated");
							 $rootScope.doingResolve = false;
                            showError(response.message, 2);
                            var complete_name = '';
                            if(typeof user.first_name !== 'undefined' && user.first_name)
                            {
                                complete_name += user.first_name+' ';
                            }
                            if(typeof user.last_name !== 'undefined' && user.last_name)
                            {
                                complete_name += user.last_name;
                            }

                            $rootScope.completeName = complete_name;

                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;
						
                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

    }
]);


app.controller('StudentProgramAddController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var student_id = $routeParams.student_id;

        $scope.program = {
            active: true
        };

        $scope.addProgramStudent = function(program)
        {
            if(program)
            {
                $scope.working = true;
                $http.post( api_url+AuthenticationService.organization_id+'/students/'+student_id+'/programs', $.param(program), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.success == true)
                        {
                            showError(response.message, 2);
                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/students/'+student_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.student = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/tags', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                var availableTags = [];
                for(var i=0; i<response.data.length; i++)
                {
                    availableTags.push(response.data[i].name);
                }

                jQuery(document).ready(function() {
                    jQuery("#cohort").tagit({
                        availableTags: availableTags
                    });
                });

                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/programs', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
                    $scope.list_program = response.data;
                }
                else
                {
                    showError(response.error.message, 1);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('StudentProgramController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var student_id = $routeParams.student_id;
        var list_program = [];

        $http.get( api_url+AuthenticationService.organization_id+'/students/'+student_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.student = response;
                $rootScope.doingResolve = false;
            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/programs', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
                    list_program = response.data;

                    $http.get( api_url+AuthenticationService.organization_id+'/students/'+student_id+'/programs', {
                        headers: {
                            'Authorization': 'Bearer '+AuthenticationService.token
                        }
                    })
                        .success(function(response) {

                            for(var i=0; i<response.data.length; i++)
                            {
                                for(var j=0; j<list_program.length; j++)
                                {
                                    if(response.data[i].program == list_program[j]._id)
                                    {
                                        response.data[i].name = list_program[j].name;
                                    }
                                }
                            }

                            $scope.programs = response.data;
                            $rootScope.doingResolve = false;
                        })
                        .error(function(response, status) {

                            console.log(response);
                            console.log(status);
                            showError(response, 1);
                            $rootScope.doingResolve = false;
                            if(status == 401)
                            {
                                CookieStore.clearData();
                                $location.path( '/login' );
                            }

                        });

                }
                else
                {
                    showError(response.error.message, 1);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);

app.controller('ProgramStudentEditController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var student_id = $routeParams.student_id;
        var program_id = $routeParams.program_id;
		var cohort = '';
		var active_status = '';
		var start_date = '';
		var end_date = '';

        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {
                $scope.program = response;
            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id+'/students/'+student_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {
				console.log(response);
                angular.forEach(response.programs, function(v, k) {

                    if(program_id == v.program)
                    {
                        active_status = v.active;
                        start_date = v.participation_start_date;
                        end_date = v.participation_end_date;
                        angular.forEach(v.cohort, function(v, k) {
                            cohort += v + ', ';
                        });
                        cohort = cohort.replace(/,\s*$/, "");
                    }

                });

                $scope.student = {
                    "_id":response._id,
                    "name": response.first_name +' '+ response.last_name,
                    "active":active_status,
                    "participation_start_date":start_date,
                    "participation_end_date":end_date,
                    "cohort":cohort
                };


                $http.get( api_url+AuthenticationService.organization_id+'/tags', {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(responseTag) {

                        var availableTags = [];
                        for(var i=0; i<responseTag.data.length; i++)
                        {
                            availableTags.push(responseTag.data[i].name);
                        }

                        jQuery(document).ready(function() {
                            jQuery("#cohort").tagit({
                                availableTags: availableTags
                            });
                        });

                    })
                    .error(function(responseTag, statusTag) {

                        console.log(responseTag);
                        console.log(statusTag);
                        showError(responseTag, 1);
                        $rootScope.doingResolve = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });

                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });


		$scope.editProgramStudent = function(student)
        {
            if(student)
            {
                $scope.working = true;
				
                $http.put( api_url+AuthenticationService.organization_id+'/programs/'+program_id+'/students/'+student_id, $.param(student), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        showError(response.message, 2);
                        $scope.working = false;
						$location.path( '/program/students/'+program_id );
                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
			
			$rootScope.editable = false;
        };
    }
]);


app.controller('StudentController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $scope.students = [];

        $scope.deleteStudent = function(id, index)
        {
            if(id)
            {
                $scope.working = true;
                $http.delete( api_url+AuthenticationService.organization_id+'/students/'+id, {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        $scope.students.splice(index, 1);
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/students', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
                    $scope.students = response.data;
                }
                else
                {
                    showError(response.error.message, 1);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('ProgramAddController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        $scope.addProgram = function(program)
        {
            if(program)
            {
                program.redirect_url = AuthenticationService.redirect_url;

                $scope.working = true;
                $http.post( api_url+AuthenticationService.organization_id+'/programs', $.param(program), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        showError(response.message, 2);
                        $scope.working = false;
						$location.path( '/program' );

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

    }
]);


app.controller('ProgramDetailController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;
		$rootScope.editable = false;

        var program_id = $routeParams.program_id;
		
		$scope.activateEditable = function(){
			$rootScope.editable = true;
		};
		
		$scope.editProgram = function(program)
        {
            if(program)
            {
                program.redirect_url = AuthenticationService.redirect_url;

                $scope.working = true;
                $http.put( api_url+AuthenticationService.organization_id+'/programs/'+program_id, $.param(program), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        showError(response.message, 2);
                        $scope.working = false;
						$location.path( 'program/detail/'+program_id );
                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
			
			$rootScope.editable = false;
        };
		
		$scope.deleteProgram = function(id, index)
        {
            if(id)
            {
                $scope.working = true;
                $http.delete( api_url+AuthenticationService.organization_id+'/programs/'+id, {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {
                        $scope.working = false;
						$location.path( '/program' )

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.program = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('ProgramEditController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var program_id = $routeParams.program_id;

        $scope.editProgram = function(program)
        {
            if(program)
            {
                program.redirect_url = AuthenticationService.redirect_url;

                $scope.working = true;
                $http.put( api_url+AuthenticationService.organization_id+'/programs/'+program_id, $.param(program), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        showError(response.message, 2);
                        $scope.working = false;
						$location.path( '/program' );
                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.program = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('ProgramStudentAddController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var program_id = $routeParams.program_id;

        $scope.program = {
            active: true
        };

        $scope.addProgramStudent = function(program)
        {
            if(program)
            {
                var rawCohart = program.cohort.split(',');
                program.cohort = rawCohart;

                console.log(program);
                $scope.working = true;
                $http.post( api_url+AuthenticationService.organization_id+'/programs/'+program_id+'/students', $.param(program), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.success == true)
                        {
                            showError(response.message, 2);
							$location.path( '/program/students/'+program_id );
                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });

            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.program = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/tags', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                var availableTags = [];
                for(var i=0; i<response.data.length; i++)
                {
                    availableTags.push(response.data[i].name);
                }

                jQuery(document).ready(function() {
                    jQuery("#cohort").tagit({
                        availableTags: availableTags
                    });
                });

                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/students', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
                    $scope.list_student = response.data;
                }
                else
                {
                    showError(response.error.message, 1);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('ProgramStudentController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;
        var program_id = $routeParams.program_id;
		var active_status = '';
		var start_date = '';
		var end_date = '';
		var cohort = '';
		$scope.students = [];
        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {
				
                $scope.program = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/programs/'+program_id+'/students', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
					
					angular.forEach(response.data, function(value, key) {
						cohort='';
						angular.forEach(value.programs, function(v, k) {
							active_status = v.active;
							start_date = v.participation_start_date;
							end_date = v.participation_end_date;
							angular.forEach(v.cohort, function(v, k) {
								cohort += v + ', '; 
							});
							cohort = cohort.replace(/,\s*$/, "");
						});
						
					var student = {
						"_id":value._id,	
						"name": value.first_name +' '+ value.last_name,
						"active":active_status,
						"start_date":start_date,
						"end_date":end_date,
						"cohort":cohort
					};
							
					$scope.students.push(student);
						
					});
					console.log($scope.students);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });
			
			$scope.deleteStudent = function(id, index)
			{
            if(id)
            {
                $scope.working = true;
                $http.delete( api_url+AuthenticationService.organization_id+'/programs/'+ program_id + '/students/' + id, {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {
						
						if(response.success)
						{
							$scope.students.splice(index, 1);
							$scope.working = false;
							$location.path( '/program/students/' + program_id )
						}
                        
                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
					
            }
        };

    }
]);


app.controller('ProgramController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $scope.programs = [];

        $scope.deleteProgram = function(id, index)
        {
			
            if(id)
            {
                $scope.working = true;
                $http.delete( api_url+AuthenticationService.organization_id+'/programs/'+id, {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {
                        $scope.programs.splice(index, 1);
                        $scope.working = false;
						$location.path( '/program' )

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/programs', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
                    $scope.programs = response.data;
                }
                else
                {
                    showError(response.error.message, 1);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('UserInviteController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        $scope.user = {
            role: 'case-worker'
        };

        $scope.inviteUser = function(user)
        {
            if(user)
            {
                user.redirect_url = AuthenticationService.redirect_url;

                $scope.working = true;
                $http.post( auth_url+'/user/invite', $.param(user), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.status == true)
                        {
                            showError(response.message, 1);
                        }
                        else
                        {
                            showError(response.message, 2);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

    }
]);


app.controller('UserGroupAddController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var user_id = $routeParams.user_id;

        $scope.students = [];
        $scope.new_student = false;

        $scope.addUserStudent = function(student, new_student)
        {
            console.log(student);
            console.log(new_student);
            if(student)
            {
                $scope.working = true;
                if(new_student == true)
                {
                    $http.post( api_url+AuthenticationService.organization_id+'/users/'+user_id+'/students', $.param(student), {
                        headers: {
                            'Authorization': 'Bearer '+AuthenticationService.token
                        }
                    }).success(function(response) {

                            $scope.working = false;
                            if(response.success)
                            {
                                showError(response.message, 2);
                            }
                            else
                            {
                                showError(response.message, 1);
                            }

                        })
                        .error(function(response, status) {

                            console.log(response);
                            console.log(status);
                            showError(response, 1);
                            $scope.working = false;
                            if(status == 401)
                            {
                                CookieStore.clearData();
                                $location.path( '/login' );
                            }

                        });
                }
                else
                {
                    $http.put( api_url+AuthenticationService.organization_id+'/users/'+user_id+'/students/'+student.student_id, {}, {
                        headers: {
                            'Authorization': 'Bearer '+AuthenticationService.token
                        }
                    }).success(function(response) {

                            $scope.working = false;
                            if(response.success)
                            {
                                showError(response.message, 2);
                            }
                            else
                            {
                                showError(response.message, 1);
                            }

                        })
                        .error(function(response, status) {

                            console.log(response);
                            console.log(status);
                            showError(response, 1);
                            $scope.working = false;
                            if(status == 401)
                            {
                                CookieStore.clearData();
                                $location.path( '/login' );
                            }

                        });
                }
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/users/'+user_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.user = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/students', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
                    $scope.list_student = response.data;
                }
                else
                {
                    showError(response.error.message, 1);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('UserGroupController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var user_id = $routeParams.user_id;

        $scope.deleteStudent = function(student_id, index)
        {
            $http.delete( api_url+AuthenticationService.organization_id+'/users/'+user_id+'/students/'+student_id, {
                headers: {
                    'Authorization': 'Bearer '+AuthenticationService.token
                }
            })
                .success(function(response) {

                    console.log(response);
                    $scope.students.splice(index, 1);
                    $scope.working = false;

                })
                .error(function(response, status) {

                    console.log(response);
                    console.log(status);
                    showError(response, 1);
                    $scope.working = false;
                    if(status == 401)
                    {
                        CookieStore.clearData();
                        $location.path( '/login' );
                    }

                });
        };

        $http.get( api_url+AuthenticationService.organization_id+'/users/'+user_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.user = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

        $http.get( api_url+AuthenticationService.organization_id+'/users/'+user_id+'/students', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                console.log(response);

                $scope.students = response.data;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('UserEditController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var user_id = $routeParams.user_id;

        $scope.editUser = function(user)
        {
            if(user)
            {
                $scope.working = true;

                if(user.is_special_case_worker == true)
                    user.is_special_case_worker2 = false;
                else
                    user.is_special_case_worker2 = true


                var passing_data = {
                    role: user.role,
                    is_special_case_worker: user.is_special_case_worker2
                };

                $http.put( api_url+'user/role/'+user_id, $.param(passing_data), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        if(response.success == true)
                        {
                            showError(response.message, 2);
                            $location.path( '/user' );
                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/users/'+user_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                var set_role = '';
                var is_special_case_worker = '';

                if(response.permissions.length > 0)
                {
                    for(var j=0; j<response.permissions.length; j++)
                    {
                        if(response.permissions[j].organization == AuthenticationService.organization_id)
                        {
                            set_role = response.permissions[j].role;
                            if(response.permissions[j].is_special_case_worker == true)
                                is_special_case_worker = false;
                            else
                                is_special_case_worker = true;
                        }
                    }
                }

                $scope.user = {
                    role: set_role,
                    is_special_case_worker: is_special_case_worker
                };
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('UserDetailController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

        var user_id = $routeParams.user_id;

        $http.get( api_url+AuthenticationService.organization_id+'/users/'+user_id, {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                $scope.user = response;
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.controller('UserController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = false;
        $scope.users = [];

        $scope.deleteUser = function(id, index)
        {
            if(AuthenticationService.user_id == id)
            {
                showError('Cannot Remove your own data', 1);
            }
            else if(AuthenticationService.role == 'case-worker')
            {
                showError("You don't have any permission to access this page", 1);
            }
            else if(id)
            {
                $scope.working = true;
                $http.delete( api_url+AuthenticationService.organization_id+'/users/'+id, {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {

                        $scope.users.splice(index, 1);
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

        $http.get( api_url+AuthenticationService.organization_id+'/users', {
            headers: {
                'Authorization': 'Bearer '+AuthenticationService.token
            }
        })
            .success(function(response) {

                if(response.success == true && response.total > 0)
                {
                    $scope.users = response.data;
                }
                else
                {
                    showError(response.error.message, 1);
                }
                $rootScope.doingResolve = false;

            })
            .error(function(response, status) {

                console.log(response);
                console.log(status);
                showError(response, 1);
                $rootScope.doingResolve = false;
                if(status == 401)
                {
                    CookieStore.clearData();
                    $location.path( '/login' );
                }

            });

    }
]);


app.filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if(keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});

app.controller('HeartbeatController', ['$rootScope', '$scope',
    function ($rootScope, $scope) {

        $rootScope.full_screen = false;
        $rootScope.doingResolve = false;

    }
]);

app.controller('LoginController', ['$rootScope', '$scope', '$http', '$location', 'AuthenticationService', 'CookieStore',
    function ($rootScope, $scope, $http, $location, AuthenticationService, CookieStore) {

        $rootScope.full_screen = true;
        $rootScope.doingResolve = false;

        var getRemember = CookieStore.get('cboAdmin_cookie_remember');
        if(getRemember == true)
        {
            $scope.login = {
                username: CookieStore.get('cboAdmin_cookie_email'),
                remember_username: true
            };
        }

        $scope.loginMe = function(username, password, remmember) {

            $scope.login.working = true;

            var auth = base64_encode( globalConfig.client_id+':'+globalConfig.client_secret );
            var grant_type = encodeURIComponent( globalConfig.grant_type );
            var uri = auth_url+'oauth2/token';
            var send = {
                grant_type: grant_type,
                username: username,
                password: password
            };

            $http.post( uri , $.param(send), {
                headers: {
                    'Authorization': 'Basic '+auth
                }
            })
                .success(function(response) {

                    $http.get( api_url+'organizations' , {
                        headers: {
                            'Authorization': 'Bearer '+response.access_token
                        }
                    })
                        .success(function(responseClient) {

                            var get_hosting_name = $location.host();
                            var grand_access = false;
                            var get_id = false;
                            var get_redirect_url = false;

                            if(responseClient.success == true && responseClient.total > 0)
                            {
                                for(var i=0; i<responseClient.total; i++)
                                {
                                    if(get_hosting_name == responseClient.data[i].url)
                                    {
                                        grand_access = true;
                                        get_id = responseClient.data[i]._id;
                                        get_redirect_url = responseClient.data[i].url;
                                    }
                                }
                            }

                            if(grand_access)
                            {
                                $http.get( api_url+get_id+'/users', {
                                    headers: {
                                        'Authorization': 'Bearer '+response.access_token
                                    }
                                })
                                    .success(function(responseUser) {

                                        if(responseUser.success == true && responseUser.total > 0)
                                        {
                                            var find = false;
                                            var data = responseUser.data;
                                            var id = false;
                                            var complete_name = '';
                                            var role = 'case-worker';
                                            for(var i=0; i<responseUser.total; i++)
                                            {
                                                if(data[i].email == send.username)
                                                {
                                                    id = data[i]._id;
                                                    if(typeof data[i].first_name !== 'undefined' && data[i].first_name)
                                                    {
                                                        complete_name += data[i].first_name+' ';
                                                    }
                                                    if(typeof data[i].last_name !== 'undefined' && data[i].last_name)
                                                    {
                                                        complete_name += data[i].last_name;
                                                    }

                                                    if(data[i].permissions.length > 0)
                                                    {
                                                        for(var j=0; j<data[i].permissions.length; j++)
                                                        {
                                                            if(data[i].permissions[j].organization == get_id)
                                                            {
                                                                role = data[i].permissions[j].role;
                                                            }
                                                        }
                                                    }

                                                    $rootScope.completeName = complete_name;
                                                    find = true;
                                                }
                                            }
                                            if(find)
                                            {
                                                CookieStore.setData( response.access_token, get_id, get_redirect_url, id, send.username, complete_name, role );

                                                if(typeof remmember !== 'undefined' && remmember == true)
                                                {
                                                    CookieStore.put_remember(true);
                                                }
                                                else
                                                {
                                                    CookieStore.put_remember(false);
                                                }

                                            }
                                            $location.path( '/' );
                                        }
                                        else
                                        {
                                            showError(response.error.message, 1);
                                        }
                                        $rootScope.doingResolve = false;

                                    })
                                    .error(function(responseUser, status) {

                                        showError(responseUser, 1);
                                        $scope.login.working = false;

                                    });

                            }
                            else
                            {
                                showError("You don't have any permission to access this page", 1);
                                $scope.login.working = false;
                            }

                        })
                        .error(function(responseClient) {

                            showError(responseClient, 1);
                            $scope.login.working = false;

                        });

                })
                .error(function(response) {

                    showError(response.error_description, 1);
                    $scope.login.working = false;

                });

        };

        $scope.forgotPassword = function(user)
        {
			
            if(user)
            {
                user.redirect_url = window.location.origin;

                $scope.working = true;
                $http.post( auth_url+'/user/send/forgotpassword', $.param(user), {
                    headers: {
                        'Authorization': 'Bearer '+AuthenticationService.token
                    }
                })
                    .success(function(response) {
						
                        if(response.status == true)
                        {
                            showError(response.message, 2);
                        }
                        else
                        {
                            showError(response.message, 1);
                        }
                        $scope.working = false;

                    })
                    .error(function(response, status) {

                        console.log(response);
                        console.log(status);
                        showError(response, 1);
                        $scope.working = false;
                        if(status == 401)
                        {
                            CookieStore.clearData();
                            $location.path( '/login' );
                        }

                    });
            }
        };

    }
]);

app.directive('ngConfirmClick', [
        function(){
            return {
                link: function (scope, element, attr) {
                    var msg = attr.ngConfirmClick || "Are you sure?";
                    var clickAction = attr.confirmedClick;
                    element.bind('click',function (event) {
                        if ( window.confirm(msg) ) {
                            scope.$eval(clickAction)
                        }
                    });
                }
            };
    }])

app.directive('contenteditable', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            // view -> model
			var clickAction = attrs.confirmedAction;
            elm.bind('blur', function() {
                var html = elm.html();
				scope.$apply(function() {
                    ctrl.$setViewValue(elm.html());
                });
				elm.html(html);
				scope.$eval(clickAction);
            });

            // model -> view
            ctrl.render = function(value) {
                elm.html(value);
            };

            // load init value from DOM
            ctrl.$setViewValue(elm.html());

            elm.bind('keydown', function(event) {
                var esc = event.which == 27,
                    el = event.target;

                if (esc) {
                        ctrl.$setViewValue(elm.html());
                        el.blur();
                        event.preventDefault();                        
                    }
                    
            });
            
        }
    };
});

app.directive('a', function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
   };
});

function showError(message, alert)
{
    var passingClass = 'alert-danger';
    if(alert == 2)
    {
        passingClass = 'alert-success'
    }

    var message_alert = '<div class="alert '+passingClass+' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'+message+'</div>';
    jQuery("#error-container").append(message_alert);
    setTimeout(function() {
        jQuery('.alert').remove();
    }, 3000);

}

function base64_encode(data) {
    //  discuss at: http://phpjs.org/functions/base64_encode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Bayron Guevara
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Rafał Kukawski (http://kukawski.pl)
    // bugfixed by: Pellentesque Malesuada
    //   example 1: base64_encode('Kevin van Zonneveld');
    //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    //   example 2: base64_encode('a');
    //   returns 2: 'YQ=='

    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    var r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}
