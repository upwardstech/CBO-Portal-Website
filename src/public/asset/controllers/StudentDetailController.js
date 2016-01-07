var general_data = "";
var attendance_data = "";
var transcript_data = "";
var program_participation_data = "";
app.controller('StudentDetailController', ['$route', '$rootScope', '$scope', '$routeParams', '$http', '$location', 'AuthenticationService', 'CookieStore', '$sce', '$window','StudentCache',
    function ($route, $rootScope, $scope, $routeParams, $http, $location, AuthenticationService, CookieStore, $sce, $window,StudentCache) {
        'use strict';

        var attendance = "";
        var transcript = "";
        var program_participation = "";
        var urlTemplate = 'asset/templates/popoverTemplate.html';
        $scope.templateUrl = 'asset/templates/popoverTemplate.html';
        $rootScope.full_screen = false;
        //$scope.student = {};
        $scope.programs = [];
        $scope.list_programs = [];
        $scope.icon_legend = true;
        $scope.open_button = false;

        $scope.close = function () {
            $scope.open_button = true;
            $scope.icon_legend = false;
        };
        $scope.open = function () {
            $scope.icon_legend = true;
            $scope.open_button = false;
        };
        var student_id = $routeParams.student_id;
        var groupValue = "_INVALID_GROUP_VALUE_";
        $scope.viewDebug = $routeParams.debug ? true : false;
        $scope.sch_history = false;
        $scope.academic = true;

        $scope.showSchoolHistory = function () {
            $scope.sch_history = true;

        };

        $scope.closeSchoolHistory = function () {
            $scope.sch_history = false;


        };

        $scope.openHeader = function(event)
        {

            var attendance_header = $(event.target).parent()[0];
            var attendance_detail = $(attendance_header).siblings()[0];
            $(attendance_detail).removeClass('hide');
            $(attendance_header).addClass('hide');

        }

        $scope.closeHeader = function(event)
        {
            var attendance_detail = $(event.target).parent()[0];
            var attendance_header = $(attendance_detail).siblings()[0];
            if ($(attendance_header).hasClass('hide')) {
                $(attendance_header).removeClass('hide');
            }
            $(attendance_detail).addClass('hide');
        }



        $scope.hideIcon = function (event) {

            var li = $(event.target).parent()[0];
            var attendance_header = $(li).parent()[0];
            var attendance_detail = $(attendance_header).siblings()[0];

            $(attendance_detail).removeClass('hide');
            $(attendance_header).addClass('hide');


        };
        $scope.showIcon = function (event) {

            var id = $(event.target).prop('id');
            var attendance_legend = $(event.target).parent()[0];
            var panel_body = $(attendance_legend).parent()[0];
            var panel_collapse = $(panel_body).parent()[0];
            var panel_heading = $($(panel_collapse).siblings(), id);
            var h4 = $(panel_heading).children()[0];
            var attendance_header = $(h4).children()[0];
            var attendance_detail = $(h4).children()[1];
            if ($(attendance_header).hasClass('hide')) {
                $(attendance_header).removeClass('hide');
            }

            $(attendance_detail).addClass('hide');

        };
        $('[data-toggle="tab"]').on('show.bs.tab', function (e) {
            $scope.setStudentDetailActiveTab(e.target.dataset.target);
            if(e.target.dataset.target === "#transcript")
            {
                //load_transcript_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope);
            }else if(e.target.dataset.target === "#program_participation")
            {
               // load_program_participation_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope);
            }else if(e.target.dataset.target === "#attendance_and_behavior")
            {
                //load_attendance_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope);
            }

        });
        // Save active tab to localStorage
        $scope.setStudentDetailActiveTab = function (activeTab) {
            localStorage.setItem("activeTabStudentDetail", activeTab);
        };

        // Get active tab from localStorage
        $scope.getStudentDetailActiveTab = function () {
            return localStorage.getItem("activeTabStudentDetail");
        };

        // Check if current tab is active
        $scope.isStudentDetailActiveTab = function (tabName, index) {
            var activeTab = $scope.getStudentDetailActiveTab();
            var is = (activeTab === tabName || (activeTab === null && index === 0));
            return is;
        };
        load_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache);

        var getXsre = function () {



                $scope.loading_icon = false;
                $('.loading-icon').removeClass('hide');
                $http.get(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/xsre', {
                    headers: {
                        'Authorization': 'Bearer ' + AuthenticationService.token
                    }
                })
                    .success(function (response) {

                        if (response.success !== false && response.info) {

                            response = response.info;
                            //StudentCache.put(student_id +"xsre",response);
                            generate_xsre_data(response,$scope)

                        } else {

                            showError(response, 1);

                        }
                        $scope.loading_icon = true;
                        $('.loading-icon').addClass('hide');
                        $rootScope.doingResolve = false;
                    })
                    .error(function (response, status) {

                        $scope.loading_icon = true;
                        $('.loading-icon').addClass('hide');
                        showError(response, 1);
                        $rootScope.doingResolve = false;
                        if (status === 401) {
                            $rootScope.show_footer = false;
                            CookieStore.clearData();
                            $location.path('/login');
                        }

                    });




        };

        getXsre();



        $scope.showDebug = function () {
            $window.open($window.location.origin + '/#/student/xsre/' + student_id);
        };

        /**
         * Update Now, remove cache and reload the page content
         */
        $scope.updateNow = function () {

            $http.delete(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/xsre', {
                headers: {
                    'Authorization': 'Bearer ' + AuthenticationService.token
                }
            })
                .success(function () {
                    //getXsre();
                })
                .error(function (response, status) {

                    $scope.loading_icon = true;
                    $('.loading-icon').addClass('hide');
                    showError(response, 1);
                    $rootScope.doingResolve = false;
                    if (status === 401) {
                        $rootScope.show_footer = false;
                        CookieStore.clearData();
                        $location.path('/login');
                    }

                });

            $http.delete(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/xsre?separate=attendance', {
                headers: {
                    'Authorization': 'Bearer ' + AuthenticationService.token
                }
            })
                .success(function () {
                    //getXsre();
                })
                .error(function (response, status) {

                    $scope.loading_icon = true;
                    $('.loading-icon').addClass('hide');
                    showError(response, 1);
                    $rootScope.doingResolve = false;
                    if (status === 401) {
                        $rootScope.show_footer = false;
                        CookieStore.clearData();
                        $location.path('/login');
                    }

                });

            $http.delete(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/xsre?separate=transcript', {
                headers: {
                    'Authorization': 'Bearer ' + AuthenticationService.token
                }
            })
                .success(function () {
                    //getXsre();
                })
                .error(function (response, status) {

                    $scope.loading_icon = true;
                    $('.loading-icon').addClass('hide');
                    showError(response, 1);
                    $rootScope.doingResolve = false;
                    if (status === 401) {
                        $rootScope.show_footer = false;
                        CookieStore.clearData();
                        $location.path('/login');
                    }

                });

            $http.delete(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/xsre?separate=assessment', {
                headers: {
                    'Authorization': 'Bearer ' + AuthenticationService.token
                }
            })
                .success(function () {
                    //getXsre();
                })
                .error(function (response, status) {

                    $scope.loading_icon = true;
                    $('.loading-icon').addClass('hide');
                    showError(response, 1);
                    $rootScope.doingResolve = false;
                    if (status === 401) {
                        $rootScope.show_footer = false;
                        CookieStore.clearData();
                        $location.path('/login');
                    }

                });
            getXsre();
        };

    }]);

function generate_xsre_data(response,$scope)
{
    var embedPrograms = [];
    var personal = $scope.personal = response.personal;
    embedPrograms = ('programs' in response._embedded) ? response._embedded.programs : [];
    //$scope.case_workers = embedUsers;
    $scope.daysAttendance = parseInt(personal.daysInAttendance);
    $scope.daysAbsent = parseInt(personal.daysAbsent);

    angular.forEach(embedPrograms, function (v) {
        var program = {
            "years": new Date(v.participation_start_date).getFullYear(),
            "name": v.program_name,
            "start_date": v.participation_start_date,
            "end_date": new Date(v.participation_end_date) >= Date.now() ? 'Present' : v.participation_end_date,
            "active": v.active ? "Active" : "Inactive",
            "cohorts": v.cohort
        };
        $scope.programs.push(program);
    });
    $scope.programs.sort(function (a, b) {
        if (a.years >= b.years) {
            return (-1);
        }
        return (1);
    });

    var yearPrograms = {};

    for (var i = 0; i < $scope.programs.length; i++) {
        var program = $scope.programs[i];

        if (Object.keys(yearPrograms).indexOf(program.years) === -1) {
            yearPrograms[program.years] = [];
        }
        yearPrograms[program.years].push(program);
    }

    angular.forEach(yearPrograms, function (items, year) {
        $scope.list_programs.push({
            years: year,
            programs: items
        });
    });

}

function load_general_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache)
{
    'use strict';

    var assignedUsers = {};
    $scope.student = {};
    $scope.xsreLastUpdated = null;

    if(angular.isUndefined(StudentCache.get(student_id + "general")) === true)
    {

        $http.get(api_url + AuthenticationService.organization_id + '/students/' + student_id+'/general', {
            headers: {
                'Authorization': 'Bearer ' + AuthenticationService.token
            }
        })
            .success(function (response) {

                if(response.success === true && response.info !== undefined)
                {
                    general_data = response.info;
                    StudentCache.put(student_id +"general",general_data);
                    generate_general_data(general_data,$scope,student_id);
                }
            })
            .error(function (response, status) {

                showError(response, 1);
                $rootScope.doingResolve = false;
                if (status === 401) {
                    $rootScope.show_footer = false;
                    CookieStore.clearData();
                    $location.path('/login');
                }

            });

    }
    else
    {
       generate_general_data(StudentCache.get(student_id + "general"),$scope,student_id);
    }



}

function generate_general_data(general_data,$scope,student_id)
{
    $.each(schoolDistricts, function (key, value) {
        if (key === general_data.personal.schoolDistrict) {
            $scope.student.schoolDistrict = value;
        }
    });

    $scope.student = general_data.personal;
    $scope.student.address = general_data.personal.address.length == 0 ? "": general_data.personal.address;
    $scope.student._id = student_id;
    $scope.student.race = general_data.personal.race.split(/(?=[A-Z])/).join(" ");
    assignedUsers = ('users' in general_data._embedded) ? general_data._embedded.users : {};
    $scope.case_workers = assignedUsers;
    $scope.academicInfo = {
        currentSchool: general_data.personal.enrollment.currentSchool || 'N/A',
        expectedGraduationYear: general_data.personal.enrollment.expectedGraduationYear || 'N/A',
        gradeLevel: general_data.personal.enrollment.gradeLevel || 'N/A',
        languageSpokenAtHome: general_data.personal.languageHome || 'N/A',
        iep: general_data.personal.ideaIndicator || 'N/A',
        s504: general_data.personal.section504Status || 'N/A',
        freeReducedLunch: (general_data.personal.eligibilityStatus && general_data.personal.enrollmentStatus) ? general_data.personal.enrollmentStatus : 'N/A'
    };
    $scope.xsreLastUpdated = general_data.lastUpdated;
}

function load_attendance_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache)
{
    'use strict';

    $scope.attendanceBehavior = [];
    var urlTemplate = 'asset/templates/popoverTemplate.html';
    if(angular.isUndefined(StudentCache.get(student_id + "attendance")) === true)
    {

        $http.get(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/attendance', {
            headers: {
                'Authorization': 'Bearer ' + AuthenticationService.token
            }
        }).success(function (response){
            if(response.success === true && response.info.data !== undefined)
            {
                attendance_data = response.info.data;
                StudentCache.put(student_id + "attendance",attendance_data);
                generate_attendance_data(attendance_data,$scope,urlTemplate);

            }
        })
            .error(function (response, status) {

                showError(response, 1);
                $rootScope.doingResolve = false;
                if (status === 401) {
                    $rootScope.show_footer = false;
                    CookieStore.clearData();
                    $location.path('/login');
                }

            });

    }
    else
    {
        generate_attendance_data(StudentCache.get(student_id + "attendance"),$scope,urlTemplate);
    }



}

function generate_attendance_data(attendance_data,$scope,urlTemplate)
{
    angular.forEach(attendance_data, function (behavior) {

        Object.keys(behavior).forEach(function (key) {
            var columnHtml = {};

            angular.forEach(behavior[key].detailColumns, function (column, i) {

                if (i !== 'periods' && i !== 'weeklyChange') {
                    var xhtml = [];
                    var x = 1;
                    var cls = '';
                    angular.forEach(column, function (item, n) {

                        if (n > 0) {
                            var html = {};
                            cls = (x % 2 === 0) ? 'light' : '';
                            x++;
                            if (typeof item === 'object' && item.event !== null) {
                                html = {
                                    slug: item.slug,
                                    stripping: cls,
                                    na: '',
                                    fontcolor: item.slug + '-font-color',
                                    pagetitle: item.slug.toUpperCase(),
                                    eventdate: item.event.calendarEventDate,
                                    description: item.event.attendanceStatusTitle,
                                    url: urlTemplate
                                };
                            } else {
                                html = {
                                    slug: '',
                                    stripping: cls,
                                    na: 'n_a',
                                    fontcolor: '',
                                    pagetitle: '',
                                    eventdate: '',
                                    description: '',
                                    url: ''
                                };
                            }
                            xhtml.push(html);
                        }
                    });

                    for (; x < 8; x++) {
                        html = {
                            slug: '',
                            stripping: '',
                            na: '',
                            fontcolor: '',
                            pagetitle: '',
                            eventdate: '',
                            description: '',
                            url: ''
                        };
                        xhtml.push(html);
                    }
                    var items = behavior[key].behaviors[i];

                    if (items.length > 0) {

                        angular.forEach(items, function (item, i) {
                            var html = {};
                            if (typeof item === 'object') {
                                html = {
                                    slug: 'unexcused',
                                    stripping: cls,
                                    na: '',
                                    fontcolor: 'unexcused-font-color',
                                    pagetitle: (item.incidentCategoryTitle + '').toUpperCase(),
                                    eventdate: item.incidentDate,
                                    description: item.description,
                                    url: urlTemplate
                                };
                            } else {
                                html = {
                                    slug: '',
                                    stripping: '',
                                    na: 'n_a',
                                    fontcolor: '',
                                    pagetitle: '',
                                    eventdate: '',
                                    description: '',
                                    url: ''
                                };
                            }
                            xhtml.push(html);
                        });
                    } else {
                        var html = {
                            slug: '',
                            stripping: '',
                            na: 'n_a',
                            fontcolor: '',
                            pagetitle: '',
                            eventdate: '',
                            description: '',
                            url: ''
                        };
                        xhtml.push(html);
                    }
                    //xhtml.push(html);
                    columnHtml[i] = xhtml;
                    behavior[key].columnHtml = columnHtml;
                    if (behavior[key].detailColumns.periods.length < 7) {
                        for (var j = 7; j > behavior[key].detailColumns.periods.length; j--) {
                            behavior[key].detailColumns.periods.push("");
                        }
                    }
                }

            });
            behavior[key].columnHtml = columnHtml;

            $scope.attendanceBehavior.push(behavior[key]);
        });
    });
}

function load_transcript_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache)
{
'use strict';
    if(angular.isUndefined(StudentCache.get(student_id + "transcript")) === true)
    {

        $http.get(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/transcript?pageSize=all', {
            headers: {
                'Authorization': 'Bearer ' + AuthenticationService.token
            }
        }).success(function (response){

            if(response.success === true && response.info !== undefined)
            {

                transcript_data = response.info || {};
                StudentCache.put(student_id + "transcript",transcript_data);
                generate_transcript_data(transcript_data,$scope);
            }
        })
            .error(function (response, status) {

                showError(response, 1);
                $rootScope.doingResolve = false;
                if (status === 401) {
                    $rootScope.show_footer = false;
                    CookieStore.clearData();
                    $location.path('/login');
                }

            });

    }
    else
    {
        generate_transcript_data(StudentCache.get(student_id + "transcript"),$scope);
    }

}

function generate_transcript_data(transcript_data,$scope)
{
    $scope.history = transcript_data.source.history;

    var courseTitle = transcript_data.source.info.courseTitle;
    $scope.courses = courseTitle;

    $scope.total_data = _.size(transcript_data.source.subject);
    $scope.transcripts =
    {
        subjectOrder : []
    };

    _.each(transcript_data.source.subject, function (item, key) {
        $scope.transcripts.subjectOrder.push({name: key, value: item});
    });
    _.each(transcript_data.data, function (item) {
        item.transcriptsOrder = [];
        _.each(item.transcripts, function (i, k) {
            item.transcriptsOrder.push({name: k, value: i});
        });
    });
    $scope.transcripts = transcript_data.data;
    $scope.credit_earned = transcript_data.source.totalCreditsEarned;
    $scope.credit_attempted = transcript_data.source.totalCreditsAttempted;
}

function load_program_participation_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope)
{
    'use strict';
    $http.get(api_url + AuthenticationService.organization_id + '/students/' + student_id + '/assessment', {
        headers: {
            'Authorization': 'Bearer ' + AuthenticationService.token
        }
    }).success(function (response){
        if(response.success === true && response.info !== undefined)
        {
            program_participation_data = response.info.data;
        }
    })
        .error(function (response, status) {

            showError(response, 1);
            $rootScope.doingResolve = false;
            if (status === 401) {
                $rootScope.show_footer = false;
                CookieStore.clearData();
                $location.path('/login');
            }

        });
}

function load_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache){
    'use strict';
    load_general_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache);
    load_attendance_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache);
    load_transcript_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope,StudentCache);
    //load_program_participation_data($http,student_id,AuthenticationService,$rootScope,CookieStore,$location,$scope);
}