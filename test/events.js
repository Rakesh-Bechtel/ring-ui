/*global describe:false, it:false, expect:false, beforeEach:false */
'use strict';
(function () {
  var ring = window.ring;

  describe('Events', function () {
    var moduleName = 'test-Events-Module';
    var moduleRet = 'lol';

    ring()('add', moduleName, {
      testMethod: function() {
        return moduleRet;
      }
    });
    var module = ring(moduleName);

    describe('On and off', function () {
      var handler = function() {};

      it('subscribe on event should be true', function () {
        expect(module.on('test-1', handler)).to.be(true);
      });

      it('dupe subscribe on event should be true', function () {
        expect(module.on('test-1', handler)).to.be(true);
      });

      it('unsubscribe from event should be true', function () {
        expect(module.off('test-1')).to.be(true);
      });

      it('dupe unsubscribe from event should be false', function () {
        expect(module.off('test-1')).to.be(false);
      });
    });

    describe('Trigger', function () {
      var toggle;
      var handler = function(ret) {
        toggle += ret;
      };
      var handler2 = function(ret) {
        toggle += ret;
      };

      beforeEach(function(){
        toggle = 0;
      });

      module.on('test-2', handler);

      it('trigger should run functions', function () {
        module.trigger('test-2', 1);
        expect(toggle).to.be.equal(1);
      });

      it('second trigger should run functions', function () {
        module.trigger('test-2', 1);
        expect(toggle).to.be.equal(1);
      });

      it('trigger should run all functions', function () {
        module.on('test-2', handler2);
        module.trigger('test-2', 1);
        expect(toggle).to.be.equal(2);
      });

      it('trigger after unsubscribe should not run functions', function () {
        module.off('test-2');
        module.trigger('test-2', 1);
        expect(toggle).to.be.equal(0);
      });
    });

    describe('One', function () {
      var toggle;
      var handler = function(ret) {
        toggle = ret;
      };

      beforeEach(function(){
        toggle = false;
      });

      it('one time subscribe on event should be true', function () {
        expect(module.one('test-3', handler)).to.be(true);
      });

      it('one time trigger should run functions', function () {
        module.trigger('test-3', true);
        expect(toggle).to.be(true);
      });

      it('one time unsubscribe from event should be false', function () {
        expect(module.off('test-3')).to.be(false);
      });

      it('second one time trigger should not run functions', function () {
        module.trigger('test-3', true);
        expect(toggle).to.be(false);
      });

    });

    describe('Events on global module', function () {
      var toggle;
      var handler = function(ret) {
        toggle = ret;
      };

      beforeEach(function(done){
        toggle = false;
        setTimeout(done, 0); // IE7 "Out of stack space" workaround. See https://github.com/visionmedia/mocha/issues/502
      });

      var o = ring();

      it('subscribe on event on global should be true', function () {
        expect(o.on(moduleName + ':test-4', handler)).to.be(true);
      });

      it('dupe subscribe on event on global should be true', function () {
        expect(o.on(moduleName + ':test-4', handler)).to.be(true);
      });

      it('trigger on global should run functions', function () {
        ring().trigger(moduleName + ':test-4', true);
        expect(toggle).to.be(true);
      });

      it('trigger set on global should run functions', function () {
        module.trigger('test-4', true);
        expect(toggle).to.be(true);
      });

      it('subscribe on event on global should be true', function () {
        expect(ring().on(moduleName + ':test-4', handler)).to.be(true);
      });

      it('unsubscribe from event on global should be true', function () {
        expect(ring().off(moduleName + ':test-4')).to.be(true);
      });

      it('dupe unsubscribe from event on global should be false', function () {
        expect(ring().off(moduleName + ':test-4')).to.be(false);
      });

      it('unsubscribe on event set on global should be true', function () {
        ring().on(moduleName + ':test-4', handler);
        expect(module.off('test-4')).to.be(true);
      });

      it('global unsubscribe from local set event should be true', function () {
        module.on('test-4', handler);
        expect(ring().off(moduleName + ':test-4')).to.be(true);
      });
    });

    describe('Namespaces', function () {
      var toggle;
      var handler = function(ret) {
        toggle += ret;
      };
      var handler2 = function(ret) {
        toggle += ret;
      };
      var handler3 = function(ret) {
        toggle += ret;
      };

      beforeEach(function(){
        toggle = 0;
      });

      it('subscribe on event w/ namespace should be true', function () {
        expect(module.on('test-5::ns1', handler)).to.be(true);
      });

      it('subscribe on event w/ other namespace should be true', function () {
        expect(module.on('test-5::ns2', handler2)).to.be(true);
        expect(module.on('test-5::ns3', handler3)).to.be(true);
      });

      it('trigger w/o namespace should run functions', function () {
        module.trigger('test-5', 1);
        expect(toggle).to.be.equal(3);
      });

      it('trigger w/ any namespace should run functions', function () {
        module.trigger('test-5::___', 1);
        expect(toggle).to.be.equal(3);
      });

      it('unsubscribe from event w/ namespace should be true', function () {
        expect(module.off('test-5::ns1')).to.be(true);
      });

      it('unsubscribe from event w/ namespace should unsubscribe from only namespaced handlers', function () {
        module.trigger('test-5', 1);
        expect(toggle).to.be.equal(2);
      });

      it('unsubscribe from event w/o namespace should be true', function () {
        expect(module.off('test-5')).to.be(true);
      });

      it('unsubscribe from event w/o namespace should unsubscribe from all handlers', function () {
        module.trigger('test-5', 1);
        expect(toggle).to.be.equal(0);
      });

    });

    describe('Module generated events', function () {
      var toggle;
      var always = function() {
        toggle += 1;
      };
      var done = function() {
        toggle += 2;
      };
      var fail = function() {
        toggle += 4;
      };

      var handler2 = function(ret) {
        toggle = ret;
      };

      var brokenModule = {
        brokenMethod: function() {}
      };
      brokenModule.brokenMethod.method = {};

      ring()('add', 'brokenModule', brokenModule);

      beforeEach(function(){
        toggle = 0;
        module.off('testMethod:done');
        module.off('testMethod:always');
        module.off('testMethod:fail');
      });

      it('method should trigger :done & :always events', function () {
        module.on('testMethod:done', done);
        module.on('testMethod:always', always);
        module.on('testMethod:fail', fail);
        module('testMethod');
        expect(toggle).to.be.equal(3);
      });

      it('multiple bound handler should return right result', function () {
        module.on('testMethod:done', done);
        module.on('testMethod:always', always);
        module.on('testMethod:fail', fail);
        module.on('testMethod:done', done);
        module.on('testMethod:always', always);
        module.on('testMethod:fail', fail);
        module('testMethod');
        expect(toggle).to.be.equal(6);
      });

      it('method triggered event should return right result', function () {
        module.on('testMethod:done', handler2);
        module('testMethod');
        expect(toggle).to.be.equal(moduleRet);
      });

      it('broken method should trigger :fail events', function () {
        ring().on('brokenModule:brokenMethod:done', done);
        ring().on('brokenModule:brokenMethod:always', always);
        ring().on('brokenModule:brokenMethod:fail', fail);
        ring('brokenModule', 'brokenMethod')();
        expect(toggle).to.be.equal(5);
      });
    });

  });

})();