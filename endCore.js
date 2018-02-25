route();

function route() {
    var renderCanvas = document.getElementById('fuelGraph');
    var camera,
        scene,
        renderer,
        octree,
        geometry,
        material,
        mesh,
        meshes = [],
        meshesSearch = [],
        meshCountMax = 200,
        radius = 1000,
        radiusMax = radius * 10,
        radiusMaxHalf = radiusMax * 0.5,
        radiusSearch = 800,
        searchMesh,
        base = new THREE.Color(0xFF0000),
        found = new THREE.Color(0xFF0000),
        adding = true,
        rayCaster = new THREE.Raycaster(),
        origin = new THREE.Vector3(),
        direction = new THREE.Vector3();
    init();
    animate();
    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        camera = new THREE.PerspectiveCamera(35, renderCanvas.scrollWidth / renderCanvas.scrollHeight, .001, radius * 100);
        scene.add(camera);
        renderer = new THREE.WebGLRenderer({
            canvas: renderCanvas,
            apha: true,
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(renderCanvas.scrollWidth, renderCanvas.scrollHeight);
        octree = new THREE.Octree({
            undeferred: false,
            depthMax: Infinity,
            objectsThreshold: 24,
            overlapPct: 0.1,
            scene: scene
        });
    }
    function animate() {
        requestAnimationFrame(animate);
        modifyOctree();
        render();
        octree.update();
    }
    var geometry = new THREE.BoxGeometry(50, 50, 50);
    function modifyOctree() {
        if (adding === true) {
            mesh = new THREE.Line(geometry, new THREE.MeshBasicMaterial({
                color: new THREE.Color(base)
            }));
            mesh.position.set(
                Math.random() * radiusMax - radiusMaxHalf,
                Math.random() * radiusMax - radiusMaxHalf,
                Math.random() * radiusMax - radiusMaxHalf
            );
            octree.add(mesh);
            scene.add(mesh);
            meshes.push(mesh);
            if (meshes.length === meshCountMax) {
                adding = false;
            }
        }
        else {
            mesh = meshes.shift();
            scene.remove(mesh);
            octree.remove(mesh);
            if (meshes.length === 0) {
                adding = true;
            }
        }
    }
    function searchOctree() {
        var i, il;
        for (i = 0, il = meshesSearch.length; i < il; i++) {
            meshesSearch[i].object.material.color.copy(base);
        }
        searchMesh.position.set(
            Math.random() * radiusMax - radiusMaxHalf,
            Math.random() * radiusMax - radiusMaxHalf,
            Math.random() * radiusMax - radiusMaxHalf
        );
        var timeStart = Date.now();
        origin.copy(searchMesh.position);
        direction.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        rayCaster.set(origin, direction);
        meshesSearch = octree.search(rayCaster.ray.origin, radiusSearch, true, rayCaster.ray.direction);
        var intersections = rayCaster.intersectOctreeObjects(meshesSearch);
        var timeEnd = Date.now();
        for (i = 0, il = meshesSearch.length; i < il; i++) {
            meshesSearch[i].object.material.color.copy(found);
        }
    }
    function render() {
        var timer = -Date.now() / 20000;
        camera.position.x = Math.cos(timer) * 10000;
        camera.position.z = Math.sin(timer) * 10000;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
};
