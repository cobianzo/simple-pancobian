/*
 * Pancobian
 * Version 1.0
 * https://www.cobianzo.com/
 */

;(function(quindow) {
    
    "use strict";

    var Pancobian = function(el) {

        // to access to the plugin instance when inside methods.
        var self = this; 		
        // 1.0 - setup, init and public methods and properties.
        console.log('Pancobian init', el);
        self.o = {
            
            callbackMouseOver: null,
            callbackMouseOut: null,
            callbackClick: null
        };
        
        self.el = el;
        self.renderer = new THREE.WebGLRenderer();
        self.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
        self.sphereMesh = null;
        self.scenes = [];

        self.currentScene = 0;
        self.currentPoster = 0;

        // interaction vars
        self.isUserInteracting = false;
        self.onMouseDownMouseX = 0; self.onMouseDownMouseY = 0;
        self.lon = 0; self.onMouseDownLon = 0;
        self.lat = 0; self.onMouseDownLat = 0;
        self.phi = 0; self.theta = 0;



        self.init = function(options) {
            self.o = Object.assign(self.o, options);
          
            // creation of every scene. (at least 1)
            self.o.scenes.forEach( (sc, i) => {
                self.createSceneWorld(sc.panorama, i, sc.name);
            });
            self.createPoster();

            // renders the first scene
            self.animate();
            
            self.el.addEventListener( 'mousedown', self.onDocumentMouseDown, false );
            self.el.addEventListener( 'mousemove', self.onDocumentMouseMove, false );
            self.el.addEventListener( 'mouseup', self.onDocumentMouseUp, false );
            self.el.addEventListener( 'wheel', self.onDocumentMouseWheel, false );

            // for debuggins. Use chrome extension three.js inspector.
            setTimeout( () => window.scene = self.getScene(), 500);

            // Now we return the instance. 
            // We can assign it to a var an access to public methods.
            return self;
        };

        // public functions.
        self.createSceneWorld = function(panorama, i, name = null) {
            console.log('creating world,', panorama);

            // 1) create the renderer on the DOM element
            self.el.appendChild( self.renderer.domElement );
            self.resizeWindow();
            self.camera.target = new THREE.Vector3( 0, 0, 0 );

            // create the sphere world.
            self.scenes[i] = new THREE.Scene();
            self.getScene(i).posters = []; // init
            self.getScene(i).name = name? name : 'Undefined';

            const sphereG = new THREE.SphereGeometry( 500, 32, 32 );
            sphereG.scale( - 1, 1, 1 );
            sphereG.name = "sp";
            const sphereMaterial = new THREE.MeshBasicMaterial( {
                color: 0xFFFFFF, 
                map: new THREE.TextureLoader().load( panorama )
            } );
            self.getScene(i).sphereMesh = new THREE.Mesh( sphereG, sphereMaterial );
            self.getScene(i).add( self.getScene(i).sphereMesh );
            self.getScene(i).sphereMesh.name = 'sphereWorld';
            // helper
            var axesHelper = new THREE.AxesHelper( 5 );
            axesHelper.name = "Gizmo";
            axesHelper.position.x = 15; axesHelper.position.y = -5; axesHelper.position.z = 5;
            self.getScene(i).add(axesHelper);
            
        }
        self.createPoster = function(image = null, attrs = {} ) {
            const materialAttrs = {color: 0xffff00, side: THREE.DoubleSide};
            if (image) materialAttrs.map = new THREE.TextureLoader().load( image );
            const plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10, 20, 3 ), new THREE.MeshBasicMaterial( materialAttrs ) );
            plane.position.z = 50;
            // we useew  a partent gizmo inn the centerof the scene to rotate respect the scene
            var planeGizmo = new THREE.Mesh( new THREE.Geometry() ); 
            planeGizmo.name = 'poster_'+self.getScene().posters.length+'_pivot';
            self.getScene().posters.push(planeGizmo);
            planeGizmo.add(plane);
            self.getScene().sphereMesh.add( planeGizmo );
        }
        // called on init and resize window event
        self.resizeWindow = function() {
            self.renderer.setPixelRatio( window.devicePixelRatio );
            self.renderer.setSize( window.innerWidth, window.innerHeight );
        }


        // helpers
        self.getScene = (index = null) => self.scenes[(index === null) ? self.currentScene : index];
        self.getPoster = (index = null) => self.getScene().posters[(index === null) ? self.currentPoster : index];
       

        // 1.1 - private methods.
        
        // Interaction private methods.
        self.onDocumentMouseDown = function ( event ) {
            event.preventDefault();
            
            self.isUserInteracting = true;

            self.onPointerDownPointerX = event.clientX;
            self.onPointerDownPointerY = event.clientY;

            self.onPointerDownLon = lon;
            self.onPointerDownLat = lat;
            
        }
        self.onDocumentMouseMove = function ( event ) {
            if ( self.isUserInteracting !== true ) return;
            self.lon = ( self.onPointerDownPointerX - event.clientX ) * 0.1 + self.onPointerDownLon;
            self.lat = ( event.clientY - self.onPointerDownPointerY ) * 0.1 + self.onPointerDownLat;
        }
        self.onDocumentMouseUp =  event => self.isUserInteracting = false;
        self.onDocumentMouseWheel = function ( event ) {
            self.camera.fov += event.deltaY * 0.15;
            self.camera.updateProjectionMatrix();
        }

        // Animation methods.
        self.animate = function() {
            
            requestAnimationFrame( self.animate );
        
            self.updateCamera();
            self.renderer.render( self.getScene(), self.camera );
        }
        self.updateCamera = function() {
            self.lat = Math.max( - 85, Math.min( 85, self.lat ) );
            self.phi = THREE.Math.degToRad( 90 - self.lat );
            self.theta = THREE.Math.degToRad( self.lon );

            self.camera.target.x = 500 * Math.sin( self.phi ) * Math.cos( self.theta );
            self.camera.target.y = 500 * Math.cos( self.phi );
            self.camera.target.z = 500 * Math.sin( self.phi ) * Math.sin( self.theta );

            self.camera.lookAt( self.camera.target );
        }


        const createGeometry = function(hotspots) {
           
            self.element.trigger('onCreatedHotpost');
        }
    }

    Element.prototype.pancobian = function(options) {
        const instance = new Pancobian(this).init(options);
        return instance;
    };
    
})(window); 
/* 	****************************************************************************************** */


/* 
    Usage
    document.querySelector('#pan-container').pancobian({ ..options object })
*/


/*
* End of this 💩
*/
