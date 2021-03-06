/*!
 *
 * threeoctree.js (r60) / https://github.com/collinhover/threeoctree
 * (sparse) dynamic 3D spatial representation structure for fast searches.
 *
 * @author Collin Hover / http://collinhover.com/
 * based on Dynamic Octree by Piko3D @ http://www.piko3d.com/ and Octree by Marek Pawlowski @ pawlowski.it
 *
 */
! function (a) {
    "use strict";

    function b(a) {
        return !isNaN(a) && isFinite(a)
    }

    function c(a) {
        return "[object Array]" === Object.prototype.toString.call(a)
    }

    function d(a) {
        return a ? c(a) !== !0 ? [a] : a : []
    }

    function e(a, b) {
        for (var c = 0, d = a.length; c < d; c++)
            if (a[c] === b) return c;
        return -1
    }

    function f(a, b, c) {
        for (var d = 0, e = a.length; d < e; d++)
            if (a[d][b] === c) return d;
        return -1
    }
    a.Octree = function (c) {
        c = c || {}, c.tree = this, this.nodeCount = 0, this.INDEX_INSIDE_CROSS = -1, this.INDEX_OUTSIDE_OFFSET = 2, this.INDEX_OUTSIDE_POS_X = b(c.INDEX_OUTSIDE_POS_X) ? c.INDEX_OUTSIDE_POS_X : 0, this.INDEX_OUTSIDE_NEG_X = b(c.INDEX_OUTSIDE_NEG_X) ? c.INDEX_OUTSIDE_NEG_X : 1, this.INDEX_OUTSIDE_POS_Y = b(c.INDEX_OUTSIDE_POS_Y) ? c.INDEX_OUTSIDE_POS_Y : 2, this.INDEX_OUTSIDE_NEG_Y = b(c.INDEX_OUTSIDE_NEG_Y) ? c.INDEX_OUTSIDE_NEG_Y : 3, this.INDEX_OUTSIDE_POS_Z = b(c.INDEX_OUTSIDE_POS_Z) ? c.INDEX_OUTSIDE_POS_Z : 4, this.INDEX_OUTSIDE_NEG_Z = b(c.INDEX_OUTSIDE_NEG_Z) ? c.INDEX_OUTSIDE_NEG_Z : 5, this.INDEX_OUTSIDE_MAP = [], this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_POS_X] = {
            index: this.INDEX_OUTSIDE_POS_X,
            count: 0,
            x: 1,
            y: 0,
            z: 0
        }, this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_NEG_X] = {
            index: this.INDEX_OUTSIDE_NEG_X,
            count: 0,
            x: -1,
            y: 0,
            z: 0
        }, this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_POS_Y] = {
            index: this.INDEX_OUTSIDE_POS_Y,
            count: 0,
            x: 0,
            y: 1,
            z: 0
        }, this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_NEG_Y] = {
            index: this.INDEX_OUTSIDE_NEG_Y,
            count: 0,
            x: 0,
            y: -1,
            z: 0
        }, this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_POS_Z] = {
            index: this.INDEX_OUTSIDE_POS_Z,
            count: 0,
            x: 0,
            y: 0,
            z: 1
        }, this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_NEG_Z] = {
            index: this.INDEX_OUTSIDE_NEG_Z,
            count: 0,
            x: 0,
            y: 0,
            z: -1
        }, this.FLAG_POS_X = 1 << this.INDEX_OUTSIDE_POS_X + 1, this.FLAG_NEG_X = 1 << this.INDEX_OUTSIDE_NEG_X + 1, this.FLAG_POS_Y = 1 << this.INDEX_OUTSIDE_POS_Y + 1, this.FLAG_NEG_Y = 1 << this.INDEX_OUTSIDE_NEG_Y + 1, this.FLAG_POS_Z = 1 << this.INDEX_OUTSIDE_POS_Z + 1, this.FLAG_NEG_Z = 1 << this.INDEX_OUTSIDE_NEG_Z + 1, this.utilVec31Search = new a.Vector3, this.utilVec32Search = new a.Vector3, this.scene = c.scene, this.scene && (this.visualGeometry = new a.CubeGeometry(1, 1, 1), this.visualMaterial = new a.MeshBasicMaterial({
            color: -1,
            wireframe: !0,
            wireframeLinewidth: 1
        })), this.objects = [], this.objectsMap = {}, this.objectsData = [], this.objectsDeferred = [], this.depthMax = b(c.depthMax) ? c.depthMax : 1 / 0, this.objectsThreshold = b(c.objectsThreshold) ? c.objectsThreshold : 8, this.overlapPct = b(c.overlapPct) ? c.overlapPct : .15, this.undeferred = c.undeferred || !1, this.root = c.root instanceof a.OctreeNode ? c.root : new a.OctreeNode(c)
    }, a.Octree.prototype = {
        update: function () {
            if (this.objectsDeferred.length > 0) {
                for (var a = 0, b = this.objectsDeferred.length; a < b; a++) {
                    var c = this.objectsDeferred[a];
                    this.addDeferred(c.object, c.options)
                }
                this.objectsDeferred.length = 0
            }
        },
        add: function (a, b) {
            this.undeferred ? (this.updateObject(a), this.addDeferred(a, b)) : this.objectsDeferred.push({
                object: a,
                options: b
            })
        },
        addDeferred: function (b, c) {
            var d, e, f, g, h, i, j;
            if (b instanceof a.OctreeObjectData && (b = b.object), b.uuid || (b.uuid = a.Math.generateUUID()), !this.objectsMap[b.uuid])
                if (this.objects.push(b), this.objectsMap[b.uuid] = b, c && (h = c.useFaces, j = c.useVertices), j === !0)
                    for (f = b.geometry, i = f.vertices, d = 0, e = i.length; d < e; d++) this.addObjectData(b, i[d]);
                else if (h === !0)
                for (f = b.geometry, g = f.faces, d = 0, e = g.length; d < e; d++) this.addObjectData(b, g[d]);
            else this.addObjectData(b)
        },
        addObjectData: function (b, c) {
            var d = new a.OctreeObjectData(b, c);
            this.objectsData.push(d), this.root.addObject(d)
        },
        remove: function (b) {
            var c, d, h, i, g = b;
            if (b instanceof a.OctreeObjectData && (b = b.object), this.objectsMap[b.uuid]) {
                if (this.objectsMap[b.uuid] = void 0, h = e(this.objects, b), h !== -1)
                    for (this.objects.splice(h, 1), i = this.root.removeObject(g), c = 0, d = i.length; c < d; c++) g = i[c], h = e(this.objectsData, g), h !== -1 && this.objectsData.splice(h, 1)
            } else this.objectsDeferred.length > 0 && (h = f(this.objectsDeferred, "object", b), h !== -1 && this.objectsDeferred.splice(h, 1))
        },
        extend: function (b) {
            var c, d, e, f;
            if (b instanceof a.Octree)
                for (e = b.objectsData, c = 0, d = e.length; c < d; c++) f = e[c], this.add(f, {
                    useFaces: f.faces,
                    useVertices: f.vertices
                })
        },
        rebuild: function () {
            var b, c, d, f, g, h, i = [];
            for (b = 0, c = this.objectsData.length; b < c; b++) f = this.objectsData[b], d = f.node, f.update(), d instanceof a.OctreeNode && !f.positionLast.equals(f.position) && (h = f.indexOctant, g = d.getOctantIndex(f), g !== h && i.push(f));
            for (b = 0, c = i.length; b < c; b++) f = i[b], f.node.removeObject(f), this.root.addObject(f)
        },
        updateObject: function (a) {
            var b, c, e, f, d = [a];
            for (e = a.parent; e;) d.push(e), e = e.parent;
            for (b = 0, c = d.length; b < c; b++) e = d[b], e.matrixWorldNeedsUpdate === !0 && (f = e);
            "undefined" != typeof f && f.updateMatrixWorld()
        },
        search: function (b, c, d, f) {
            var g, h, i, j, k, l, m, n, o, p, q;
            for (j = [].concat(this.root.objects), c > 0 || (c = Number.MAX_VALUE), f instanceof a.Vector3 && (f = this.utilVec31Search.copy(f).normalize(), q = this.utilVec32Search.set(1, 1, 1).divide(f)), g = 0, h = this.root.nodesIndices.length; g < h; g++) i = this.root.nodesByIndex[this.root.nodesIndices[g]], j = i.search(b, c, j, f, q);
            if (d === !0)
                for (m = [], o = [], g = 0, h = j.length; g < h; g++) k = j[g], l = k.object, p = e(o, l), p === -1 ? (n = {
                    object: l,
                    faces: [],
                    vertices: []
                }, m.push(n), o.push(l)) : n = m[p], k.faces ? n.faces.push(k.faces) : k.vertices && n.vertices.push(k.vertices);
            else m = j;
            return m
        },
        findClosestVertex: function (a, b) {
            var c = this.search(a, b, !0);
            if (!c[0]) return null;
            var d = c[0].object,
                e = c[0].vertices;
            if (0 === e.length) return null;
            for (var f, g = null, h = d.worldToLocal(a.clone()), i = 0, j = e.length; i < j; i++) f = e[i].distanceTo(h), f > b || (b = f, g = e[i]);
            return null === g ? null : d.localToWorld(g.clone())
        },
        setRoot: function (b) {
            b instanceof a.OctreeNode && (this.root = b, this.root.updateProperties())
        },
        getDepthEnd: function () {
            return this.root.getDepthEnd()
        },
        getNodeCountEnd: function () {
            return this.root.getNodeCountEnd()
        },
        getObjectCountEnd: function () {
            return this.root.getObjectCountEnd()
        },
        toConsole: function () {
            this.root.toConsole()
        }
    }, a.OctreeObjectData = function (b, c) {
        this.object = b, c instanceof a.Face3 ? (this.faces = c, this.face3 = !0, this.utilVec31FaceBounds = new a.Vector3) : c instanceof a.Face4 ? (this.face4 = !0, this.faces = c, this.utilVec31FaceBounds = new a.Vector3) : c instanceof a.Vector3 && (this.vertices = c), this.radius = 0, this.position = new a.Vector3, this.object instanceof a.Object3D ? this.update() : (this.position.set(b.x, b.y, b.z), this.radius = b.radius), this.positionLast = this.position.clone()
    }, a.OctreeObjectData.prototype = {
        update: function () {
            this.face3 ? (this.radius = this.getFace3BoundingRadius(this.object, this.faces), this.position.copy(this.faces.centroid).applyMatrix4(this.object.matrixWorld)) : this.face4 ? (this.radius = this.getFace4BoundingRadius(this.object, this.faces), this.position.copy(this.faces.centroid).applyMatrix4(this.object.matrixWorld)) : this.vertices ? (null === this.object.geometry.boundingSphere && this.object.geometry.computeBoundingSphere(), this.radius = this.object.geometry.boundingSphere.radius, this.position.copy(this.vertices).applyMatrix4(this.object.matrixWorld)) : this.object.geometry ? (null === this.object.geometry.boundingSphere && this.object.geometry.computeBoundingSphere(), this.radius = this.object.geometry.boundingSphere.radius, this.position.copy(this.object.geometry.boundingSphere.center).applyMatrix4(this.object.matrixWorld)) : (this.radius = this.object.boundRadius, this.position.getPositionFromMatrix(this.object.matrixWorld)), this.radius = this.radius * Math.max(this.object.scale.x, this.object.scale.y, this.object.scale.z)
        },
        getFace3BoundingRadius: function (a, b) {
            var j, c = a.geometry || a,
                d = c.vertices,
                e = b.centroid,
                f = d[b.a],
                g = d[b.b],
                h = d[b.c],
                i = this.utilVec31FaceBounds;
            return e.addVectors(f, g).add(h).divideScalar(3), j = Math.max(i.subVectors(e, f).length(), i.subVectors(e, g).length(), i.subVectors(e, h).length())
        },
        getFace4BoundingRadius: function (a, b) {
            var k, c = a.geometry || a,
                d = c.vertices,
                e = b.centroid,
                f = d[b.a],
                g = d[b.b],
                h = d[b.c],
                i = d[b.d],
                j = this.utilVec31FaceBounds;
            return e.addVectors(f, g).add(h).add(i).divideScalar(4), k = Math.max(j.subVectors(e, f).length(), j.subVectors(e, g).length(), j.subVectors(e, h).length(), j.subVectors(e, i).length())
        }
    }, a.OctreeNode = function (b) {
        this.utilVec31Branch = new a.Vector3, this.utilVec31Expand = new a.Vector3, this.utilVec31Ray = new a.Vector3, b = b || {}, b.tree instanceof a.Octree ? this.tree = b.tree : b.parent instanceof a.OctreeNode != !0 && (b.root = this, this.tree = new a.Octree(b)), this.id = this.tree.nodeCount++, this.position = b.position instanceof a.Vector3 ? b.position : new a.Vector3, this.radius = b.radius > 0 ? b.radius : 1, this.indexOctant = b.indexOctant, this.depth = 0, this.reset(), this.setParent(b.parent), this.overlap = this.radius * this.tree.overlapPct, this.radiusOverlap = this.radius + this.overlap, this.left = this.position.x - this.radiusOverlap, this.right = this.position.x + this.radiusOverlap, this.bottom = this.position.y - this.radiusOverlap, this.top = this.position.y + this.radiusOverlap, this.back = this.position.z - this.radiusOverlap, this.front = this.position.z + this.radiusOverlap, this.tree.scene && (this.visual = new a.Mesh(this.tree.visualGeometry, this.tree.visualMaterial), this.visual.scale.set(2 * this.radiusOverlap, 2 * this.radiusOverlap, 2 * this.radiusOverlap), this.visual.position.copy(this.position), this.tree.scene.add(this.visual))
    }, a.OctreeNode.prototype = {
        setParent: function (a) {
            a !== this && this.parent !== a && (this.parent = a, this.updateProperties())
        },
        updateProperties: function () {
            var b, c;
            for (this.parent instanceof a.OctreeNode ? (this.tree = this.parent.tree, this.depth = this.parent.depth + 1) : this.depth = 0, b = 0, c = this.nodesIndices.length; b < c; b++) this.nodesByIndex[this.nodesIndices[b]].updateProperties()
        },
        reset: function (a, b) {
            var c, d, e, f = this.nodesIndices || [],
                g = this.nodesByIndex;
            for (this.objects = [], this.nodesIndices = [], this.nodesByIndex = {}, c = 0, d = f.length; c < d; c++) e = g[f[c]], e.setParent(void 0), a === !0 && e.reset(a, b);
            b === !0 && this.visual && this.visual.parent && this.visual.parent.remove(this.visual)
        },
        addNode: function (a, b) {
            a.indexOctant = b, e(this.nodesIndices, b) === -1 && this.nodesIndices.push(b), this.nodesByIndex[b] = a, a.parent !== this && a.setParent(this)
        },
        removeNode: function (a) {
            var b, c;
            b = e(this.nodesIndices, a), this.nodesIndices.splice(b, 1), c = c || this.nodesByIndex[a], delete this.nodesByIndex[a], c.parent === this && c.setParent(void 0)
        },
        addObject: function (b) {
            var c, d, f;
            d = this.getOctantIndex(b), d > -1 && this.nodesIndices.length > 0 ? (f = this.branch(d), f.addObject(b)) : d < -1 && this.parent instanceof a.OctreeNode ? this.parent.addObject(b) : (c = e(this.objects, b), c === -1 && this.objects.push(b), b.node = this, this.checkGrow())
        },
        addObjectWithoutCheck: function (a) {
            var b, c, d;
            for (b = 0, c = a.length; b < c; b++) d = a[b], this.objects.push(d), d.node = this
        },
        removeObject: function (a) {
            var b, c, d, e;
            if (e = this.removeObjectRecursive(a, {
                    searchComplete: !1,
                    nodesRemovedFrom: [],
                    objectsDataRemoved: []
                }), d = e.nodesRemovedFrom, d.length > 0)
                for (b = 0, c = d.length; b < c; b++) d[b].shrink();
            return e.objectsDataRemoved
        },
        removeObjectRecursive: function (b, c) {
            var d, f, h, i, j, g = -1;
            if (b instanceof a.OctreeObjectData) g = e(this.objects, b), g !== -1 && (this.objects.splice(g, 1), b.node = void 0, c.objectsDataRemoved.push(b), c.searchComplete = j = !0);
            else
                for (d = this.objects.length - 1; d >= 0; d--)
                    if (h = this.objects[d], h.object === b && (this.objects.splice(d, 1), h.node = void 0, c.objectsDataRemoved.push(h), j = !0, !h.faces && !h.vertices)) {
                        c.searchComplete = !0;
                        break
                    } if (j === !0 && c.nodesRemovedFrom.push(this), c.searchComplete !== !0)
                for (d = 0, f = this.nodesIndices.length; d < f && (i = this.nodesByIndex[this.nodesIndices[d]], c = i.removeObjectRecursive(b, c), c.searchComplete !== !0); d++);
            return c
        },
        checkGrow: function () {
            this.objects.length > this.tree.objectsThreshold && this.tree.objectsThreshold > 0 && this.grow()
        },
        grow: function () {
            var a, b, h, i, c = [],
                d = [],
                e = [],
                f = [],
                g = [];
            for (h = 0, i = this.objects.length; h < i; h++) b = this.objects[h], a = this.getOctantIndex(b), a > -1 ? (e.push(b), f.push(a)) : a < -1 ? (c.push(b), d.push(a)) : g.push(b);
            e.length > 0 && (g = g.concat(this.split(e, f))), c.length > 0 && (g = g.concat(this.expand(c, d))), this.objects = g, this.checkMerge()
        },
        split: function (a, b) {
            var c, d, e, f, g, h;
            if (this.depth < this.tree.depthMax) {
                for (a = a || this.objects, b = b || [], h = [], c = 0, d = a.length; c < d; c++) f = a[c], e = b[c], e > -1 ? (g = this.branch(e), g.addObject(f)) : h.push(f);
                a === this.objects && (this.objects = h)
            } else h = this.objects;
            return h
        },
        branch: function (b) {
            var c, d, e, f, g, h;
            return this.nodesByIndex[b] instanceof a.OctreeNode ? c = this.nodesByIndex[b] : (e = .5 * this.radiusOverlap, d = e * this.tree.overlapPct, f = e - d, g = this.utilVec31Branch.set(1 & b ? f : -f, 2 & b ? f : -f, 4 & b ? f : -f), h = (new a.Vector3).addVectors(this.position, g), c = new a.OctreeNode({
                tree: this.tree,
                parent: this,
                position: h,
                radius: e,
                indexOctant: b
            }), this.addNode(c, b)), c
        },
        expand: function (b, c) {
            var d, e, f, g, h, i, j, l, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, H, I, m = this.tree.INDEX_OUTSIDE_MAP,
                G = this.utilVec31Expand;
            if (this.tree.root.getDepthEnd() < this.tree.depthMax) {
                for (b = b || this.objects, c = c || [], g = [], h = [], d = 0, e = m.length; d < e; d++) m[d].count = 0;
                for (d = 0, e = b.length; d < e; d++) f = b[d], i = c[d], i < -1 ? (j = -i - this.tree.INDEX_OUTSIDE_OFFSET, j & this.tree.FLAG_POS_X ? m[this.tree.INDEX_OUTSIDE_POS_X].count++ : j & this.tree.FLAG_NEG_X && m[this.tree.INDEX_OUTSIDE_NEG_X].count++, j & this.tree.FLAG_POS_Y ? m[this.tree.INDEX_OUTSIDE_POS_Y].count++ : j & this.tree.FLAG_NEG_Y && m[this.tree.INDEX_OUTSIDE_NEG_Y].count++, j & this.tree.FLAG_POS_Z ? m[this.tree.INDEX_OUTSIDE_POS_Z].count++ : j & this.tree.FLAG_NEG_Z && m[this.tree.INDEX_OUTSIDE_NEG_Z].count++, h.push(f)) : g.push(f);
                if (h.length > 0)
                    for (n = m.slice(0), n.sort(function (a, b) {
                            return b.count - a.count
                        }), o = n[0], r = 1 | o.index, t = n[1], u = n[2], p = (1 | t.index) !== r ? t : u, s = 1 | p.index, t = n[2], u = n[3], v = n[4], w = 1 | t.index, x = 1 | u.index, q = w !== r && w !== s ? t : x !== r && x !== s ? u : v, y = o.x + p.x + q.x, z = o.y + p.y + q.y, A = o.z + p.z + q.z, i = this.getOctantIndexFromPosition(y, z, A), l = this.getOctantIndexFromPosition(-y, -z, -A), B = this.overlap, C = this.radius, E = this.tree.overlapPct > 0 ? B / (.5 * this.tree.overlapPct * (1 + this.tree.overlapPct)) : 2 * C, F = E * this.tree.overlapPct, D = E + F - (C + B), G.set(1 & i ? D : -D, 2 & i ? D : -D, 4 & i ? D : -D), H = (new a.Vector3).addVectors(this.position, G), I = new a.OctreeNode({
                            tree: this.tree,
                            position: H,
                            radius: E
                        }), I.addNode(this, l), this.tree.setRoot(I), d = 0, e = h.length; d < e; d++) this.tree.root.addObject(h[d]);
                b === this.objects && (this.objects = g)
            } else g = b;
            return g
        },
        shrink: function () {
            this.checkMerge(), this.tree.root.checkContract()
        },
        checkMerge: function () {
            for (var c, b = this; b.parent instanceof a.OctreeNode && b.getObjectCountEnd() < this.tree.objectsThreshold;) c = b, b = b.parent;
            b !== this && b.merge(c)
        },
        merge: function (a) {
            var b, c, g;
            for (a = d(a), b = 0, c = a.length; b < c; b++) g = a[b], this.addObjectWithoutCheck(g.getObjectsEnd()), g.reset(!0, !0), this.removeNode(g.indexOctant, g);
            this.checkMerge()
        },
        checkContract: function () {
            var b, c, d, e, f, g, h;
            if (this.nodesIndices.length > 0) {
                for (g = 0, h = this.objects.length, b = 0, c = this.nodesIndices.length; b < c; b++) d = this.nodesByIndex[this.nodesIndices[b]], e = d.getObjectCountEnd(), h += e, (f instanceof a.OctreeNode == !1 || e > g) && (f = d, g = e);
                h -= g, h < this.tree.objectsThreshold && f instanceof a.OctreeNode && this.contract(f)
            }
        },
        contract: function (a) {
            var b, c, d;
            for (b = 0, c = this.nodesIndices.length; b < c; b++) d = this.nodesByIndex[this.nodesIndices[b]], d !== a && (a.addObjectWithoutCheck(d.getObjectsEnd()), d.reset(!0, !0));
            a.addObjectWithoutCheck(this.objects), this.reset(!1, !0), this.tree.setRoot(a), a.checkContract()
        },
        getOctantIndex: function (b) {
            var e, f, j, k, l, m, n, o, p, g = this.position,
                h = this.radiusOverlap,
                i = this.overlap,
                q = 0;
            if (b instanceof a.OctreeObjectData ? (f = b.radius, e = b.position, b.positionLast.copy(e)) : b instanceof a.OctreeNode && (e = b.position, f = 0), j = e.x - g.x, k = e.y - g.y, l = e.z - g.z, m = Math.abs(j), n = Math.abs(k), o = Math.abs(l), p = Math.max(m, n, o), p + f > h) return m + f > h && (q ^= j > 0 ? this.tree.FLAG_POS_X : this.tree.FLAG_NEG_X), n + f > h && (q ^= k > 0 ? this.tree.FLAG_POS_Y : this.tree.FLAG_NEG_Y), o + f > h && (q ^= l > 0 ? this.tree.FLAG_POS_Z : this.tree.FLAG_NEG_Z), b.indexOctant = -q - this.tree.INDEX_OUTSIDE_OFFSET, b.indexOctant;
            if (j - f > -i) q = 1 | q;
            else if (!(j + f < i)) return b.indexOctant = this.tree.INDEX_INSIDE_CROSS, b.indexOctant;
            if (k - f > -i) q = 2 | q;
            else if (!(k + f < i)) return b.indexOctant = this.tree.INDEX_INSIDE_CROSS, b.indexOctant;
            if (l - f > -i) q = 4 | q;
            else if (!(l + f < i)) return b.indexOctant = this.tree.INDEX_INSIDE_CROSS, b.indexOctant;
            return b.indexOctant = q, b.indexOctant
        },
        getOctantIndexFromPosition: function (a, b, c) {
            var d = 0;
            return a > 0 && (d = 1 | d), b > 0 && (d = 2 | d), c > 0 && (d = 4 | d), d
        },
        search: function (a, b, c, d, e) {
            var f, g, h, i;
            if (i = d ? this.intersectRay(a, d, b, e) : this.intersectSphere(a, b), i === !0)
                for (c = c.concat(this.objects), f = 0, g = this.nodesIndices.length; f < g; f++) h = this.nodesByIndex[this.nodesIndices[f]], c = h.search(a, b, c, d);
            return c
        },
        intersectSphere: function (a, b) {
            var c = b * b,
                d = a.x,
                e = a.y,
                f = a.z;
            return d < this.left ? c -= Math.pow(d - this.left, 2) : d > this.right && (c -= Math.pow(d - this.right, 2)), e < this.bottom ? c -= Math.pow(e - this.bottom, 2) : e > this.top && (c -= Math.pow(e - this.top, 2)), f < this.back ? c -= Math.pow(f - this.back, 2) : f > this.front && (c -= Math.pow(f - this.front, 2)), c >= 0
        },
        intersectRay: function (a, b, c, d) {
            "undefined" == typeof d && (d = this.utilVec31Ray.set(1, 1, 1).divide(b));
            var l, e = (this.left - a.x) * d.x,
                f = (this.right - a.x) * d.x,
                g = (this.bottom - a.y) * d.y,
                h = (this.top - a.y) * d.y,
                i = (this.back - a.z) * d.z,
                j = (this.front - a.z) * d.z,
                k = Math.min(Math.min(Math.max(e, f), Math.max(g, h)), Math.max(i, j));
            return !(k < 0) && (l = Math.max(Math.max(Math.min(e, f), Math.min(g, h)), Math.min(i, j)), !(l > k || l > c))
        },
        getDepthEnd: function (a) {
            var b, c, d;
            if (this.nodesIndices.length > 0)
                for (b = 0, c = this.nodesIndices.length; b < c; b++) d = this.nodesByIndex[this.nodesIndices[b]], a = d.getDepthEnd(a);
            else a = !a || this.depth > a ? this.depth : a;
            return a
        },
        getNodeCountEnd: function () {
            return this.tree.root.getNodeCountRecursive() + 1
        },
        getNodeCountRecursive: function () {
            var a, b, c = this.nodesIndices.length;
            for (a = 0, b = this.nodesIndices.length; a < b; a++) c += this.nodesByIndex[this.nodesIndices[a]].getNodeCountRecursive();
            return c
        },
        getObjectsEnd: function (a) {
            var b, c, d;
            for (a = (a || []).concat(this.objects), b = 0, c = this.nodesIndices.length; b < c; b++) d = this.nodesByIndex[this.nodesIndices[b]], a = d.getObjectsEnd(a);
            return a
        },
        getObjectCountEnd: function () {
            var a, b, c = this.objects.length;
            for (a = 0, b = this.nodesIndices.length; a < b; a++) c += this.nodesByIndex[this.nodesIndices[a]].getObjectCountEnd();
            return c
        },
        getObjectCountStart: function () {
            for (var b = this.objects.length, c = this.parent; c instanceof a.OctreeNode;) b += c.objects.length, c = c.parent;
            return b
        },
        toConsole: function (a) {
            var b, c, d, e = "   ";
            for (a = "string" == typeof a ? a : e, console.log(this.parent ? a + " octree NODE > " : " octree ROOT > ", this, " // id: ", this.id, " // indexOctant: ", this.indexOctant, " // position: ", this.position.x, this.position.y, this.position.z, " // radius: ", this.radius, " // depth: ", this.depth), console.log(this.parent ? a + " " : " ", "+ objects ( ", this.objects.length, " ) ", this.objects), console.log(this.parent ? a + " " : " ", "+ children ( ", this.nodesIndices.length, " )", this.nodesIndices, this.nodesByIndex), b = 0, c = this.nodesIndices.length; b < c; b++) d = this.nodesByIndex[this.nodesIndices[b]], d.toConsole(a + e)
        }
    }, a.Raycaster.prototype.intersectOctreeObject = function (b, c) {
        var d, e, f, g;
        return b.object instanceof a.Object3D ? (e = b, b = e.object, g = e.faces, f = b.geometry.faces, g.length > 0 && (b.geometry.faces = g), d = this.intersectObject(b, c), g.length > 0 && (b.geometry.faces = f)) : d = this.intersectObject(b, c), d
    }, a.Raycaster.prototype.intersectOctreeObjects = function (a, b) {
        var c, d, e = [];
        for (c = 0, d = a.length; c < d; c++) e = e.concat(this.intersectOctreeObject(a[c], b));
        return e.sort(function (a, b) {
            return a.distance - b.distance
        }), e
    }
}(THREE);
