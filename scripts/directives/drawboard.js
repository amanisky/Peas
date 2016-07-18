'use strict';

angular.module('App')
  .directive('drawBoard', ['$document', function($document) {
    return {
      restrict: 'AE',
      scope: {
        width: '@',
        canvas: '=',
        save: '&'
      },
      template: '<div class="painter"><div class="painter-tool"><div class="btn-group"><button class="btn btn-sm btn-default rotate_left"><i class="fa fa-rotate-left"></i>左旋转</button><button class="btn btn-sm btn-default zoom_out"><i class="fa fa-search-minus"></i>缩小</button><button class="btn btn-sm btn-default fit"><i class="fa fa-arrows-alt"></i>还原</button><button class="btn btn-sm btn-default zoom_in"><i class="fa fa-search-plus"></i>放大</button><button class="btn btn-sm btn-default rotate_right"><i class="fa fa-rotate-right"></i>右旋转</button></div></div><div class="painter-container"><div class="painter-zoom"><div class="painter-rotate" data-ng-transclude></div></div></div></div>',
      replace: true,
      transclude: true,
      link: function(scope, element, attrs) {
        console.log(scope.canvas);
        element.css('width', scope.width || 1040);
        var zoomStep = 0.1,
            scale = 1,
            angle = 0,
            startX = 0,
            startY = 0,
            x = 0,
            y = 0,
            canvasId = Math.floor(Math.random() * 1e10),
            sketcher = null,
            $rotate = element.find('.painter-rotate'),
            $zoom = element.find('.painter-zoom');

        // 是否需要画布
        if (scope.canvas) {
          element.children('.painter-tool').append('<div class="btn-group"><button class="btn btn-sm btn-default thickness"><i class="fa fa-circle"></i>粗细</button><button class="btn btn-sm btn-default colors" style="color: #f34e36;"><i class="fa fa-crosshairs"></i>颜色</button><button class="btn btn-sm btn-default pencil"><i class="fa fa-pencil"></i>画笔</button><button class="btn btn-sm btn-default eraser"><i class="fa fa-eraser"></i>橡皮擦</button><button class="btn btn-sm btn-default drag"><i class="fa fa fa-hand-stop-o"></i>拖动</button></div><div class="btn-group"><button class="btn btn-sm btn-default back"><i class="fa fa-mail-reply"></i>撤销</button><button class="btn btn-sm btn-default forward"><i class="fa fa-mail-forward"></i>重做</button><button class="btn btn-sm btn-default clear"><i class="fa fa-trash-o"></i>清除</button><button class="btn btn-sm btn-default save"><i class="fa fa-upload"></i>保存</button></div><ul class="thickness-changer"><li class="active"data-size="1"></li><li data-size="2"></li><li data-size="3"></li><li data-size="4"></li><li data-size="5"></li><li data-size="6"></li><li data-size="7"></li><li data-size="8"></li></ul><ul class="color-changer"><li style="background-color: #f34e36;"data-color="#f34e36"></li><li style="background-color: #b5d947;"data-color="#b5d947"></li><li style="background-color: #9d6fc8;"data-color="#9d6fc8"></li><li style="background-color: #4abcdd;"data-color="#4abcdd"></li><li style="background-color: #1abc9c;"data-color="#1abc9c"></li><li style="background-color: #c61c72;"data-color="#c61c72"></li><li style="background-color: #f4a622;"data-color="#f4a622"></li><li style="background-color: #2ecc71;"data-color="#2ecc71"></li></ul>')
          $rotate.append('<canvas id="' + canvasId + '"></canvas>');
          sketcher = new Atrament(canvasId, $zoom.width(), $zoom.height());
          sketcher.weight = 1;
          sketcher.color = '#f34e36';
          sketcher.smoothing = true;
          sketcher.canvas.style.pointerEvents = 'auto';

          if (scope.canvas !== true) {
            sketcher.drawImage(scope.canvas, 0, 0);
          }
        }

        // 放大
        element.find('.zoom_in').click(function() {
          scale += zoomStep;
          if (scale >= 1.8) {
            scale = 1.8;
          }

          $zoom.css({
            'transform': 'scale(' + scale + ')'
          });

          if (sketcher) {
            sketcher.canvas.style.pointerEvents = "none";
          }
        });

        // 缩小
        element.find('.zoom_out').click(function() {
          scale -= zoomStep;

          if (scale <= 0.5) {
            scale = 0.5;
          }

          $zoom.css('transform', 'scale(' + scale + ')');

          if (sketcher) {
            sketcher.canvas.style.pointerEvents = "none";
          }
        });

        // 还原
        element.find('.fit').click(function() {
          scale = 1;
          angle = 0;

          $zoom.css('transform', 'scale(' + scale + ')');

          $rotate.css({
            'transform': 'rotate(' + angle + ')',
            'top': 0,
            'left': 0
          });

          if (sketcher) {
            sketcher.canvas.style.pointerEvents = "none";
          }
        });

        // 左旋转
        element.find('.rotate_left').click(function() {
          angle += 90;
          $rotate.css('transform', 'rotate(' + -angle + 'deg)');
          if (sketcher) {
            sketcher.canvas.style.pointerEvents = "none";
          }
        });

        // 右旋转
        element.find('.rotate_right').click(function() {
          angle -= 90;
          $rotate.css('transform', 'rotate(' + -angle + 'deg)');
          if (sketcher) {
            sketcher.canvas.style.pointerEvents = "none";
          }
        });

        // 画笔
        element.find('.pencil').click(function() {
          sketcher.mode = 'draw';
          sketcher.canvas.style.pointerEvents = "auto";
        });

        // 橡皮擦
        element.find('.eraser').click(function() {
          sketcher.mode = 'erase';
          sketcher.canvas.style.pointerEvents = "auto";
        });

        // 颜色
        element.find('.colors').click(function(e) {
          var $this = $(this);

          element.find('.thickness-changer').slideUp();

          element.find('.color-changer')
            .slideToggle()
            .click(function(e) {
              var color = $(e.target).data('color');
              $this.css('color', color);
              sketcher.color = color;
              $(this).slideUp(function() {
                $this.next().addClass('active');
                sketcher.mode = 'draw';
                sketcher.canvas.style.pointerEvents = "auto";
              });
            });
        });

        // 粗细
        element.find('.thickness').click(function() {
          var $this = $(this);
          element.find('.color-changer').slideUp();
          element.find('.thickness-changer')
            .slideToggle()
            .click(function(e) {
              var size = $(e.target).data('size');
              $(e.target).addClass('active').siblings().removeClass('active');
              sketcher.weight = size;
              $(this).slideUp(function() {
                $this.siblings('.pencil').addClass('active');
                sketcher.mode = 'draw';
                sketcher.canvas.style.pointerEvents = "auto";
              });
            });
        });

        // 撤销
        element.find('.back').click(function() {
          if (sketcher.stack.canUndo()) {
            sketcher.stack.undo();
          }
        });

        // 重做
        element.find('.forward').click(function() {
          if (sketcher.stack.canRedo()) {
            sketcher.stack.redo();
          }
        });

        // 清除
        element.find('.clear').click(function() {
          sketcher.clear();
          if (scope.canvas !== true) {
            sketcher.drawImage(scope.canvas, 0, 0);
          }
        });

        // 保存
        element.find('.save').click(function() {
          var img = sketcher.toImage();
          scope.save({img: img});
        });

        // 切换画笔or拖动
        element.find('.drag').click(function() {
          sketcher.canvas.style.pointerEvents = "none";
        });

        // 按钮状态
        element.find('.painter-tool').click(function(e) {
          $(this).find('.btn').removeClass('active');

          if (e.target.tagName === 'BUTTON') {
            $(e.target).addClass('active');
          }
        });

        // 拖动
        $rotate.on('mousedown', function(event) {
          event.preventDefault();
          if (sketcher && sketcher.canvas.style.pointerEvents == 'auto') {
            return false;
          }
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
          $rotate.css('cursor', 'grab');
        });

        function mousemove(event) {
          y = event.pageY - startY;
          x = event.pageX - startX;
          $rotate.css({
            top: y + 'px',
            left:  x + 'px',
            cursor: 'grabbing'
          });
        }

        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
          $rotate.css('cursor', 'move');
        }
      }
    };
  }]);
