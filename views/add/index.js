var view = require('../../lib/view');
var Blocks = require('../../lib/blocks');
var blocks = new Blocks();
var analytics = require('../../lib/analytics');

var id = null;
var app = null;

module.exports = view.extend({
  id: 'add',
  template: require('./index.html'),
  computed: {
    noBlock: function () {
      return this.$data.app.blocks ? this.$data.app.blocks.length : 0;
    }
  },
  data: {
    // Provide a specific sort order
    title: 'Add Content',
    back: true,
    app: {},
    blocks: [
      blocks.text,
      blocks.image,
      blocks.sms,
      blocks.phone,
      blocks.link,
      blocks.separator
    ],
    inputBlocks: [],
    goBack: function (e) {
      e.preventDefault();
      this.page(this.$data.back);
    }
  },
  ready: function () {
    var self = this;

    // Fetch app
    id = self.$root.$data.params.id;
    app = self.$root.storage.getApp(id);

    self.$data.back = '/make/' + id;

    // Bind app
    if (app.data) {
      self.$root.isReady = true;
      self.$data.app = app.data;
    }
    self.$on(id, function (val) {
      self.$root.isReady = true;
      self.$data.app = val;
    });
    self.$data.onDone = '/make/' + id + '/share?publish=true';

    // Click handler
    function clickHandler(e) {
      e.preventDefault();

      // Attributes
      var blockId = e.currentTarget.getAttribute('data-block');

      // Add block to make
      app.insert(blockId);
      analytics.event({
        category: 'Blocks',
        action: 'Add',
        label: blockId
      });

      // Add to model & redirect to block edit page.
      // Newly added block always in index 0.
      if (blockId === 'image') {
        global.history.back();
      } else {
        self.page('/make/' + id + '/block/0');
      }
    }

    // Apply click handler to each cell
    var targets = self.$el.querySelectorAll('.brick');
    for (var i = 0; i < targets.length; i++) {
      targets[i].addEventListener('click', clickHandler);
    }

    // Apply click handler to parent element
    self.$el.addEventListener('click', function (e) {
      if (e.target.id === 'add-container') {
        e.preventDefault();
        self.page('/make/' + id);
      }
    });
  }
});
