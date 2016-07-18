'use strict';

angular
  .module('App', [])
  .controller('BoardController', function($scope) {
    $scope.imgPath = "images/b.png";
    $scope.abc = 123;
    $scope.upload = function(img) {
      console.log(img);
    };
  });
