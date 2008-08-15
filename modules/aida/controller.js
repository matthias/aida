
importModule('helma.logging', 'logging');
logging.setConfig(getResource('config/environments/development/log4j.properties').path);
var logger = logging.getLogger(__name__);

importModule('javascript.prototype');

importFromModule("controller.controller", "*");
importFromModule("controller.filters", "*");
importFromModule("controller.helpers", "*");
importFromModule("controller.render", "*");
importFromModule("controller.actions", "*");
importFromModule("controller.layout", "*");
importFromModule("controller.request", "*");

importFromModule("config.environments.development.development", "config");
this.context = {};
