
angular.module('postControllers', ['ngFileUpload'])

.controller('postCtrl', ['$scope', '$http', 'Upload', '$routeParams', '$location', '$rootScope', function($scope, $http, Upload, $routeParams, $location, $rootScope) {

    var userData = {
        author: $routeParams.userId
    };

    // Array for storing posts
    $scope.posts = [];

    if($location.url() === '/') {
        userData.author = $rootScope.loginUserId;
        userData.page = 'home';
    } 
    else {
        userData.author = $routeParams.userId;
    }

    $scope.showHideComment = false;

    // Get all the post for user timeline
    $http.post('/api/posts', userData).then((posts) => {
        $scope.posts = posts.data;
        posts.data.forEach(function(post) {
            post.time = moment(post.time).fromNow();

            // getting comments of current post
            $http.post('/api/post/getComments', {postId: post._id}).then((comments) => {
                post.comments = comments.data;
                comments.data.forEach(function(comment) {
                    comment.commentedOn = moment(comment.commentedOn).fromNow();
                })
            }).catch((err) => {
                console.log(err);
            });

            // getting likes of current post
            // $http.post('api/post/likes', {_id: post._id}).then((result) => {
            //     result.data.forEach(function(like) {
            //         if(like.userId === userData.author) {
            //             post.imgsrc = '../../../assets/icons/like/liked.png';
            //         }
            //     });
            // }).catch((err) => {
            //     console.log(err);
            // });

        });
    }).catch((err) => {
        console.log(err);
    }); // End of getting all posts


    // add new post to user profile
    $scope.newPost = {};
    $scope.newPost.author = userData.author;
    $scope.newPost.description = '';
    
    $scope.submit = function() {
        if ($scope.form.file.$valid && $scope.file) {
            $scope.upload($scope.file);
        }
    };

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: 'api/newPost',
            data: {file: file, newPost: $scope.newPost}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            console.log(resp);
            $http.post('/api/posts', userData).then((posts) => {
                posts.data[0].time = moment(posts.data[0].time).fromNow();
                $scope.posts.unshift(posts.data[0]);
            }).catch((err) => {
                console.log(err);
            });

        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };


    // comment insertion
    // click on comment post button
    $scope.placeComment = function(postId, userId, index) {
        $http.post('/api/post/newComment', {
            postId: postId,
            userId: userId,
            commentedText: $scope.posts[index].comment
        }).then((result) => {
            $http.post('/api/post/getComment', {_id: result.data._id}).then((comment) => {
                comment.data.commentedOn = moment(comment.data.commentedOn).fromNow();
                $scope.posts[index].comments.push(comment.data);
                $scope.posts[index].comment = '';
            });
        }).catch((err) => {
            console.log(err);
        });
    };

    $scope.deleteComment = function(commentId, parentIndex, index) {
        $http.post('/api/post/deleteComment', {_id: commentId}).then((result) => {
            $scope.posts[parentIndex].comments.splice(index, 1);
        }).catch((err) => {
            console.log(err);
        });
    };
    

    // $scope.postLiked = (postId, userId, index) => {
    //     $http.post('/api/postLiked', { postId: postId, userId: userId }).then((resp) => {
    //         // $scope.posts[index]
    //     }).catch((err) => {
    //         console.log(err);
    //     })
    // };


}]);