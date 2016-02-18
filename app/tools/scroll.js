/**
 * Created by Martin on 15.1.14.
 */
(function(){

  var special = jQuery.event.special,
    uid1 = 'D' + (+new Date()),
    uid2 = 'D' + (+new Date() + 1);

  special.scrollstart = {
    setup: function() {

      var timer,
        handler =  function(evt) {

          var _self = this,
            _args = arguments;

          if (timer) {
            clearTimeout(timer);
          } else {
            //evt.type = 'scrollstart';
            //jQuery.event.handle.apply(_self, _args);
            jQuery.event.simulate('scrollstart', this, evt);
            //$.event.dispatch.call( obj, event );
          }

          timer = setTimeout( function(){
            timer = null;
          }, special.scrollstop.latency);

        };

      jQuery(this).bind('scroll', handler).data(uid1, handler);

    },
    teardown: function(){
      jQuery(this).unbind( 'scroll', jQuery(this).data(uid1) );
    }
  };

  special.scrollstop = {
    latency: 300,
    setup: function() {

      var timer,
        handler = function(evt) {

          var _self = this,
            _args = arguments;

          if (timer) {
            clearTimeout(timer);
          }

          timer = setTimeout( function(){

            timer = null;
            //evt.type = 'scrollstop';
            //jQuery.event.handle.apply(_self, _args);
            jQuery.event.simulate('scrollstop', this, evt);

          }, special.scrollstop.latency);

        };

      jQuery(this).bind('scroll', handler).data(uid2, handler);

    },
    teardown: function() {
      jQuery(this).unbind( 'scroll', jQuery(this).data(uid2) );
    }
  };

})();