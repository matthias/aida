importModule('helma.logging', 'logging');
var log = logging.getLogger(__name__);


var __shared__ = true;


// used to determine whether config should be re-loaded on each new DB session
var isDevEnvironment = false;


(function () {

   var isConfigured = false;
   var config;
   var sessionFactory;

   /**
    * Sets the basic Hibernate configuration.
    */
   this.setConfig = function () {
      var configPropsPath = getResource('db.properties').name;
      var configDirPath = configPropsPath.replace('db.properties', '');
      var inputStream = new java.io.FileInputStream(new java.io.File(configPropsPath));
      var configProps = new java.util.Properties();

      // load db.properties
      configProps.load(inputStream);
      inputStream.close();

      // set configuration
      config = new org.hibernate.cfg.Configuration();
      config.setProperties(configProps);
      config.setProperty('hibernate.default_entity_mode', 'dynamic-map');
      config.addDirectory(new java.io.File(configDirPath));

      isConfigured = true;
      log.info('Configuration set successfully.');

      return;
   };


   /**
    * Template taking care of configuration, session & transaction management
    * plus executing the actual Hibernate session API wrapper method operations.
    */
   this.getHibernateTemplate = function (params) {
      if (this.isDevEnvironment || !isConfigured) {
         this.setConfig();
         sessionFactory = config.buildSessionFactory();
      }

      var sess = sessionFactory.openSession();
      var txn = sess.beginTransaction();

      // do the actual operation
      switch (params.method) {
         case 'save':
            sess['saveOrUpdate(java.lang.String,java.lang.Object)'](params.object._type ||
                                                                    params.object.$type$, params.object);
            break;
         case 'get':
            var result = sess.get(new java.lang.String(params.type), new java.lang.Integer(params.id));
            if (result != null) {
               result = new org.helma.util.ScriptableMap(result);
            }
            break;
         case 'find':
            var result = new org.helma.util.ScriptableList(this, sess.find(new java.lang.String(params.query)));
            for (var i in result) {
               result[i] = new org.helma.util.ScriptableMap(result[i]);
            }
            break;
         case 'all':
            var result = new org.helma.util.ScriptableList(this, sess.find(new java.lang.String('from ' + params.type)));
            for (var i in result) {
               result[i] = new org.helma.util.ScriptableMap(result[i]);
            }
            break;
         case 'remove':
            sess['delete(java.lang.Object)'](params.object);
            break;
         default:
            break;
      }

      txn.commit();
      sess.close();
      //sessionFactory.close();

      return result || null;
   };


// Hibernate session API wrapper methods:

   this.save = function (object) {
      try {
         return this.getHibernateTemplate({ method: 'save', object: object });
      } catch (e) {
         log.error('in "save": ' + e.toString());
         return;
      }
   };

   this.get = function (type, id) {
      try {
         return this.getHibernateTemplate({ method: 'get', type: type, id: id });
      } catch (e) {
         log.error('in "get": ' + e.toString());
         return;
      }
   };

   this.find = function (query) {
      try {
         return this.getHibernateTemplate({ method: 'find', query: query });
      } catch (e) {
         log.error('in "find": ' + e.toString());
         return;
      }
   };

   this.all = function (type) {
      try {
         return this.getHibernateTemplate({ method: 'all', type: type });
      } catch (e) {
         log.error('in "all": ' + e.toString());
         return;
      }
   };

   this.remove = function (object) {
      try {
         return this.getHibernateTemplate({ method: 'remove', object: object });
      } catch (e) {
         log.error('in "remove": ' + e.toString());
         return;
      }
   };

}).call(this);


/**
 * Generic constructor wrapping model prototypes into ScriptableMap objects.
 */
function Storable(type, properties) {
   var scriptableMap = new org.helma.util.ScriptableMap(new java.util.HashMap());

   for (var i in properties) {
      scriptableMap[i] = (typeof properties[i] == 'string') ? properties[i].stripTags() : properties[i];
   }
   scriptableMap['_type'] = type;

   log.info(type + ' constructed successfully.');

   return scriptableMap;
}
