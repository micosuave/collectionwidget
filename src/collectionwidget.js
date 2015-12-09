'use strict';

angular.module('adf.widget.collectionwidget', ['adf.provider', 'firebase'])
    .config(function(dashboardProvider) {
        dashboardProvider
            .widget('curationwidget', {
                title: 'Curation',
                description: 'Build a simple interface to complex objects',
                templateUrl: '{widgetsPath}/collectionwidget/src/view.html',
                controller: 'CurationWidgetCtrl',
                controllerAs: 'curation',
                frameless: true,
                reload: true,
                titleTemplateUrl: '{widgetsPath}/collectionwidget/src/titleTemplateUrl.html',
                resolve: {
                    curation: ["config", "$firebaseObject", "$rootScope", "FIREBASE_URL",
                        function(config, $firebaseObject, $rootScope, FIREBASE_URL) {
                            if (config.id) {
                                return $firebaseObject(new Firebase(FIREBASE_URL + 'content/' + config.id));
                            } else {
                                var a = new Firebase(FIREBASE_URL + 'content/');
                                var b = {};
                                a.push({
                                    'name': 'curation'
                                }).then(function(ref) {
                                    var id = ref.key();
                                    ref.update({
                                        id: id,
                                        projectid: $rootScope.$stateParams.pId || 'projectid',
                                        matterId: $rootScope.$stateParams.matterId || 'matterId',
                                        groupId: $rootScope.$stateParams.groupId || 'groupId',
                                        author: $rootScope.authData.uid || 'userid',
                                        ispublished: false,
                                        content_type: 'curation',
                                        timestamp: Firebase.ServerValue.TIMESTAMP
                                    });

                                    config.id = id;
                                    var b = $firebaseObject(ref);
                                    b.$bindTo($scope, 'curation');
                                    b.title = 'New Curation';
                                    return b;
                                });
                                return b;


                            }

                        }
                    ]
                },
                edit: {
                    templateUrl: '{widgetsPath}/collectionwidget/src/edit.html',
                    controller: 'CurationWidgetConfigCtrl',
                    modalSize: 'sm',
                    reload: true
                }
            })
            .widget('userwidget', {
                title: 'User',
                description: 'Manage your user account',
                templateUrl: '{widgetsPath}/collectionwidget/src/user.html',
                controller: 'UserWidgetCtrl',
                controllerAs: 'user',
                frameless: true,
                reload: true,
                titleTemplateUrl: '{widgetsPath}/collectionwidget/src/titleTemplateUrl.html',
                config: {
                    url: 'https://milbank-patentphd.firebaseio.com/'
                },
                edit: {
                    templateUrl: '{widgetsPath}/collectionwidget/src/edit.html',
                    controller: 'CollectionWidgetConfigCtrl',
                    modalSize: 'lg',
                    reload: true
                }
            });
    });
angular.module('adf.widget.collectionwidget')
    .constant('FIREBASE_URL', 'https://lexlab.firebaseio.com/')
    .controller('CurationWidgetCtrl', ['$scope', 'config', '$firebaseObject', '$firebaseArray', '$firebaseAuth', 'FIREBASE_URL', 'Matter', '$rootScope', 'Curation', 'CuratedItems', 'Collections', 'Collection', 'ROARevents',
        function($scope, config, $firebaseObject, $firebaseArray, $firebaseAuth, FIREBASE_URL, Matter, $rootScope, Curation, CuratedItems, Collections, Collection, ROARevents) {
            $scope.config = config;
            if (!config.id) {
                config.id = '';
            }
            var curation = Curation(config.id);
            curation.$bindTo($scope, 'curation');
            var matter = Matter($rootScope.$stateParams.matterId);
            $scope.matter = matter;
            // var FIREBASE_URL = 'https://milbank-patentphd.firebaseio.com/';
            $scope.curation_types = CURATIONTYPES;

            $scope.addcontent = function(item) {
                var item = item;
                item.name = item.title;
                var curateditems = CuratedItems();
                curateditems.$add(item).then(function(ref) {
                    var id = ref.key();
                    $scope.curation.data.push(id);
                    ref.update({
                        id: id,
                        timestamp: Firebase.ServerValue.TIMESTAMP,
                        author: $rootScope.authData.uid,
                        accesslist: $rootScope.$stateParams.groupId,
                        projectid: $rootScope.$stateParams.pId,
                        matterId: $rootScope.$stateParams.matterId,
                        curationid: $scope.curation.$id
                    })
                });
            };
            $scope.addevent = function(data) {
                angular.forEach(data, function(file, key) {

                    var filename = file.name;
                    var roarevent = {};
                    roarevent.content_type = 'document';
                    roarevent.media = file.url.replace('/view?usp=drive_web', '/preview');
                    roarevent.iconUrl = file.iconUrl;
                    roarevent.uuid = file.id;
                    roarevent.name = filename;
                    roarevent.mimeType = file.mimeType;
                    roarevent.file = file;
                    roarevent.parent = $scope.curation.$id;
                    var a = roarevent.collectionIds = new Array();
                    a.push($scope.curation.$id);

                    var curateditems = CuratedItems();
                    curateditems.$add(roarevent).then(function(ref) {
                        var id = ref.key();

                        ref.update({
                            id: id,
                            timestamp: Firebase.ServerValue.TIMESTAMP,
                            author: $rootScope.authData.uid || 'userid',
                            accesslist: $rootScope.$stateParams.groupId || 'groupId',
                            projectid: $rootScope.$stateParams.pId || 'projectid',
                            matterId: $rootScope.$stateParams.matterId || 'matterId',
                            curationid: $scope.curation.$id,
                            content_type: 'document'
                        });
                        if (angular.isUndefined($scope.curation.data)) {
                            var data = new Array();
                            data.push(id);

                            angular.extend($scope.curation, {
                                data: data
                            });
                            $scope.curation.$save();
                        } else {
                            $scope.curation.data.push(id);
                            $scope.curation.$save();
                        }
                    });


                })
            };
            $scope.addById = function(id) {
                if (angular.isUndefined($scope.curation.data)) {
                    var data = new Array();
                    data.push(id);

                    angular.extend($scope.curation, {
                        data: data
                    });
                    $scope.curation.$save();
                } else {
                    $scope.curation.data.push(id);
                    $scope.curation.$save();
                }
            };
            // $scope.onDropComplete = function($data, $event) {

            //     var id = $data.$id;
            //     if (angular.isUndefined($scope.curation.doclist)) {
            //         var doclist = new Array();
            //         doclist.push(id);

            //         angular.extend($scope.curation, {
            //             doclist: doclist
            //         });
            //         $scope.curation.$save();
            //     } else {
            //         $scope.curation.doclist.push(id);
            //         $scope.curation.$save();
            //     }
            // };
            $scope.publish = function(curationId) {
                // var matter = Matter($rootScope.$stateParams.matterId);
                if (angular.isUndefined($scope.matter.curationlist)) {
                    // var curationlist = new Array();
                    $scope.matter.curationlist = new Array();
                    $scope.matter.curationlist.push(curationId);
                    $scope.matter.$save();
                    $scope.curation.ispublished = true;
                    //$scope.curation.$save();
                } else {
                    $scope.matter.curationlist.push(curationId);
                    $scope.matter.$save();
                    $scope.curation.ispublished = true;
                    //$scope.curation.$save();
                }
            };
            $scope.addfilehistory = function(files) {

                var matterId = $stateParams.matterId;
                var matter = Matter(matterId);
                var collections = Collections();
                var roarlist = function() {
                    var roarlist = new Array();
                    angular.forEach(files, function(file, key) {
                        roarlist.push(file.uuid);
                    });
                    return roarlist;
                };





                var newcollection = {
                    'name': 'USSN ' + $scope.history.APPNUM,
                    'rid': 'PHD1',
                    'collectiontype': 'source',
                    'box': 'PhD for USSN ' + $scope.history.APPNUM,
                    'styleClass': 'success',
                    'app': $scope.history.APPNUM,
                    'content_type': 'collection',
                    'roarlist': roarlist
                };

                var newcollectionId = collections.$add(newcollection).then(function(ref) {

                    var newcollectionId = ref.key();


                    ref.update({
                        id: newcollectionId,
                        timestamp: Firebase.ServerValue.TIMESTAMP,
                        matter: $stateParams.matterId,
                        project: $stateParams.pId


                    });

                    if (angular.isUndefined(matter.collectionlist)) {
                        matter.collectionlist = new Array();

                        matter.collectionlist.push(newcollectionId);
                        matter.$save();
                    } else {
                        matter.collectionlist.push(newcollectionId);
                        matter.$save();
                    }
                    $scope.newcollectionId = newcollectionId;
                    var all = $firebaseObject(ref);
                    all.$bindTo($scope, 'allcollection');
                    return all;
                });

                var newmeritscollection = {
                    'name': ('USSN ' + $scope.history.APPNUM + '_Merits'),
                    'rid': 'PhD2',
                    'collectiontype': 'source',
                    'box': 'PhD for USSN ' + $scope.history.APPNUM,
                    'styleClass': 'danger',
                    'app': $scope.history.APPNUM,
                    'content_type': 'collection',
                    'roarlist': roarlist
                };



                var meritscollectionId = collections.$add(newmeritscollection).then(function(ref) {

                    var meritscollectionId = ref.key();


                    ref.update({
                        id: meritscollectionId,
                        timestamp: Firebase.ServerValue.TIMESTAMP,
                        matter: $stateParams.matterId,
                        project: $stateParams.pId


                    });

                    if (angular.isUndefined(matter.collectionlist)) {
                        matter.collectionlist = new Array();

                        matter.collectionlist.push(meritscollectionId);
                        matter.$save();
                    } else {
                        matter.collectionlist.push(meritscollectionId);
                        matter.$save();
                    }
                    $scope.meritscollectionId = meritscollectionId;
                    var merits = $firebaseObject(ref);
                    merits.$bindTo($scope, 'meritscollection');
                    return merits;
                });


                var newartcollection = {
                    'name': ('USSN ' + $scope.history.APPNUM + '_Art'),
                    'rid': 'PhD3',
                    'collectiontype': 'source',
                    'box': 'PhD for USSN ' + $scope.history.APPNUM,
                    'styleClass': 'warning',
                    'app': $scope.history.APPNUM,
                    'content_type': 'collection',
                    'roarlist': roarlist
                };



                var artcollectionId = collections.$add(newartcollection).then(function(ref) {

                    var artcollectionId = ref.key();


                    ref.update({
                        id: artcollectionId,
                        timestamp: Firebase.ServerValue.TIMESTAMP,
                        matter: $stateParams.matterId,
                        project: $stateParams.pId


                    });

                    if (angular.isUndefined(matter.collectionlist)) {
                        matter.collectionlist = new Array();

                        matter.collectionlist.push(artcollectionId);
                        matter.$save();
                    } else {
                        matter.collectionlist.push(artcollectionId);
                        matter.$save();
                    }
                    $scope.artcollectionId = artcollectionId;
                    var art = $firebaseObject(ref);
                    art.$bindTo($scope, 'artcollection');
                    return art;
                });

                var newownershipcollection = {
                    'name': ('USSN ' + $scope.history.APPNUM + '_Ownership'),
                    'rid': 'PhD4',
                    'collectiontype': 'source',
                    'box': 'PhD for USSN ' + $scope.history.APPNUM,
                    'styleClass': 'info',
                    'app': $scope.history.APPNUM,
                    'content_type': 'collection',
                    'roarlist': roarlist
                };



                var ownershipcollectionId = collections.$add(newownershipcollection).then(function(ref) {

                    var ownershipcollectionId = ref.key();


                    ref.update({
                        id: ownershipcollectionId,
                        timestamp: Firebase.ServerValue.TIMESTAMP,
                        matter: $stateParams.matterId,
                        project: $stateParams.pId


                    });

                    if (angular.isUndefined(matter.collectionlist)) {
                        matter.collectionlist = new Array();

                        matter.collectionlist.push(ownershipcollectionId);
                        matter.$save();
                    } else {
                        matter.collectionlist.push(ownershipcollectionId);
                        matter.$save();
                    }
                    $scope.ownershipcollectionId = ownershipcollectionId;
                    var owns = $firebaseObject(ref);
                    owns.$bindTo($scope, 'ownership');
                    return owns;
                });
                var allbuffer = new Array();
                var meritsbuffer = new Array();
                var artsbuffer = new Array();
                var ownershipbuffer = new Array();

                $timeout(function() {

                    angular.forEach(files, function(file, key) {

                        var filename = file.name;
                        var appnumsubstring = filename.slice(0, filename.indexOf("-"));
                        var appdatesubstring = filename.slice((filename.indexOf("-") + 1), (filename.indexOf("-") + 11));
                        var doccode = filename.slice((filename.lastIndexOf("-") + 1), (filename.indexOf(".pdf")));
                        $scope.roarevent.content_type = 'document';
                        $scope.roarevent.media = file.url.replace('/view?usp=drive_web', '/preview');
                        $scope.roarevent.iconUrl = file.iconUrl;
                        $scope.roarevent.uuid = file.id;

                        $scope.roarevent.mimeType = file.mimeType;
                        $scope.roarevent.description = doccode + '\n' + appdatesubstring + '\n' + appnumsubstring;
                        $scope.roarevent.collections = [];
                        $scope.roarevent.appId = appnumsubstring;
                        $scope.roarevent.date = appdatesubstring;
                        $scope.roarevent.rid = files.indexOf(file);
                        $scope.roarevent.file = file;
                        $scope.roarevent.doccode = doccode;
                        $scope.roarevent.collections.push($scope.newcollectionId);
                        angular.forEach(APPDOCCODES, function(code, key) {
                            if (doccode === code) {
                                $scope.roarevent.styleClass = 'Applicant';
                            }
                        });
                        angular.forEach(PTODOCCODES, function(code, key) {
                            if (doccode === code) {
                                $scope.roarevent.styleClass = 'PTO';
                            }
                        });
                        angular.forEach(INTVDOCCODES, function(code, key) {
                            if (doccode === code) {
                                $scope.roarevent.styleClass = 'Interview';
                            }
                        });
                        angular.forEach(NOADOCCODES, function(code, key) {
                            if (doccode === code) {
                                $scope.roarevent.styleClass = 'NOA';
                            }
                        });
                        angular.forEach(PETDOCCODES, function(code, key) {
                            if (doccode === code) {
                                $scope.roarevent.styleClass = 'Petition';
                            }
                        });
                        angular.forEach(DOCNAMES, function(code, key) {
                            angular.forEach(code, function(value, key) {

                                if (doccode === key) {
                                    $scope.roarevent.name = value;
                                    $scope.roarevent.title = value;
                                }
                            });
                        });

                        angular.forEach(MERITSDOCS, function(code, key) {
                            if (doccode === code) {
                                //$scope.roarevent.collections = [];
                                //$scope.roarevent.collections.push($scope.newcollectionId);
                                $scope.roarevent.collections.push($scope.meritscollectionId);

                            }
                        });

                        angular.forEach(ARTDOCS, function(code, key) {
                            if (doccode === code) {
                                //$scope.roarevent.collections = [];
                                //$scope.roarevent.collections.push($scope.newcollectionId);
                                $scope.roarevent.collections.push($scope.artcollectionId);

                            }
                        });

                        angular.forEach(OWNERSHIPDOCS, function(code, key) {
                            if (doccode === code) {
                                //$scope.roarevent.collections = [];
                                //$scope.roarevent.collections.push($scope.newcollectionId);
                                $scope.roarevent.collections.push($scope.ownershipcollectionId);

                            }
                        });



                        ROARevents.$add($scope.roarevent).then(function(ref) {
                            var id = ref.key();
                            console.log("added record with id " + id);

                            ref.update({
                                id: id,

                                timestamp: Firebase.ServerValue.TIMESTAMP
                            });




                            $scope.roarevent = {};
                        });


                    });


                }, 1000);

            };

        }
    ])
    .controller('CurationWidgetConfigCtrl', ['$scope', 'config', '$rootScope', 'Matter',
        function($scope, config, Curation, $rootScope, Matter) {
            var curation = Curation(config.id);
            curation.$bindTo($scope, 'curation');
            $scope.curation = config;
            var newfield = {
                newfield: "New Value"
            };
            $scope.addfield = function() {
                angular.extend(curation, {
                    newfield: newfield
                });
            };
            $scope.publishtomatter = function() {
                var matter = Matter($rootScope.$stateParams.matterId);
                if (angular.isUndefined(matter.curationlist)) {
                    var curationlist = new Array();
                    angular.extend(matter, {
                        curationlist: curationlist
                    });
                    matter.curationlist.push(config.id);
                    matter.$save();
                } else {
                    matter.curationlist.push(config.id);
                }
            }


        }
    ]);
// .controller('UserWidgetCtrl', ['$scope', '$rootScope', 'toastr', '$firebaseAuth', function($scope, $rootScope, toastr, $firebaseAuth) {

//     var FIREBASE_URL = 'https://lexlab.firebaseio.com/';
//     var ref = new Firebase(FIREBASE_URL);
//     var user = this;
//     user.authObj = $firebaseAuth(ref);
//     toastr.success('hello');
//     var authData = user.authObj.$getAuth();

//     if (authData) {
//         $rootScope.authData = authData;
//         toastr.info('Logged in as ' + authData.password.email, 'Connected!');







//     }

//     user.login = function() {
//         ref.authWithPassword({
//             email: user.email,
//             password: user.password
//         }, function(error, authData) {
//             if (error === null) {
//                 // user authenticated with Firebase
//                 console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
//                 toastr.success(authData.password.email, 'Authentication successful!', {
//                     //iconClass: 'rlabel Applicant rounded'
//                 });

//                 $scope.authData = authData;
//                 $rootScope.authData = authData;
//                 var amOnline = new Firebase(FIREBASE_URL + '.info/connected');
//                 var userRef = new Firebase(FIREBASE_URL + 'presence/' + authData.uid);
//                 // since I can connect from multiple devices or browser tabs, we store each connection instance separately
//                 // any time that connectionsRef's value is null (i.e. has no children) I am offline
//                 var myConnectionsRef = new Firebase(FIREBASE_URL + 'profiles/' + authData.uid + '/connections');

//                 // stores the timestamp of my last disconnect (the last time I was seen online)
//                 var lastOnlineRef = new Firebase(FIREBASE_URL + 'profiles/' + authData.uid + '/lastOnline');
//                 var connectedRef = new Firebase(FIREBASE_URL + '.info/connected');
//                 var lastLoginRef = new Firebase(FIREBASE_URL + 'profiles/' + authData.uid + '/lastLogin');

//                 var connectedRef = new Firebase(FIREBASE_URL + '.info/connected');
//                 connectedRef.on('value', function(snap) {
//                     if (snap.val() === true) {
//                         // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

//                         // add this device to my connections list
//                         // this value could contain info about the device or a timestamp too
//                         var con = myConnectionsRef.push(true);
//                         lastLoginRef.set(Firebase.ServerValue.TIMESTAMP);

//                         // when I disconnect, remove this device
//                         con.onDisconnect().remove();

//                         // when I disconnect, update the last time I was seen online
//                         lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
//                     }
//                 });
//                 amOnline.on('value', function(snapshot) {
//                     if (snapshot.val()) {
//                         userRef.onDisconnect().remove();
//                         userRef.set('★ online');
//                         $document.onIdle = function() {
//                             userRef.set('☆ idle');
//                         };
//                         $document.onAway = function() {
//                             userRef.set('☄ away');
//                         };
//                         $document.onBack = function(isIdle, isAway) {
//                             userRef.set('★ online');
//                         };

//                     }
//                 });
//                 // var a = move.select('.panel');
//                 // move(a).set('top',750).scale(3).set('opacity', 0).duration(3000).end().then(function(){
//                 // // var b = move.select('.panel');
//                 // // move(b).set('opacity',0).scale(0.25).duration(3000).end();
//                 // // var c = move.select('#loginflexbutton');
//                 // // move(c).translate(-500).duration(3000).end();
//                 // // var d = move.select('#loginpagecontainer');
//                 // // move(d).translate(500).duration(3000).end().then(function(){

//                 //        var e = move.select('[navbarbleu]'),
//                 //             f = move.select('[matterwidget]');
//                 //       move(e).set('right',1200).duration(0).end().then(function(){
//                 //         move(e).set('right',0).duration(2000).end();});

//                 //       move(f).set('left',1200).duration(0).end().then(function(){
//                 //         move(f).set('left',0).duration(2000).end();});
//                 //       }


//                 // );
//                 // var c = move.select('#loginflexbutton');
//                 //   move(c).set('-webkit-transform','rotate3d(30deg,90deg,0deg)').translate(-500).duration(3000).end();


//             } else {
//                 console.log("Error authenticating user:", error);
//                 toastr.error("Error authenticating user. Please check your username and password.");
//             }

//         })
//     }

// }]);
// .controller('FileCurationCtrl', ['$scope', '$firebaseArray', 'FIREBASE_URL', 'Curation', 'config', '$rootScope', function($scope, $firebaseArray, FIREBASE_URL, Curation, config, $rootScope) {
//     $scope.curation = Curation(config.id);




//     $scope.addevent = function(data) {
//         angular.forEach(data, function(file, key) {

//             var filename = file.name;
//             var roarevent = {};

//             roarevent.media = file.url.replace('/view?usp=drive_web', '/preview');
//             roarevent.iconUrl = file.iconUrl;
//             roarevent.uuid = file.id;
//             roarevent.name = filename;
//             roarevent.mimeType = file.mimeType;
//             roarevent.file = file;
//             roarevent.parent = $scope.curation.$id;
//             var a = roarevent.collectionIds = new Array();
//             a.push($scope.curation.$id);

//             var curateditems = $firebaseArray(new Firebase(FIREBASE_URL + 'collections/'));
//             curateditems.$add(roarevent).then(function(ref) {
//                 var id = ref.key();
//                 ref.update({
//                     id: id,
//                     timestamp: Firebase.ServerValue.TIMESTAMP,
//                     author: $rootScope.authData.uid,
//                     accesslist: $rootScope.$stateParams.groupId,
//                     projectid: $rootScope.$stateParams.pId,
//                     matterId: $rootScope.$stateParams.matterId,
//                     curationid: $scope.curation.$id,
//                     content_type: 'document'
//                 });
//                 if (angular.isUndefined($scope.curation.data)) {
//                     var data = new Array();
//                     data.push(id);

//                     angular.extend($scope.curation, {
//                         data: data
//                     });
//                     $scope.curation.$save();
//                 } else {
//                     $scope.curation.data.push(id);
//                     $scope.curation.$save();
//                 }
//             });


//         })
//     }
// }]);
