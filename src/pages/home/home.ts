import { Component, ElementRef, HostListener } from '@angular/core';

import { NavController } from 'ionic-angular';

import * as D3 from 'd3';

import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})

export class HomePage {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.Renderer;
	geometry: THREE.Geometry;
	materials: Array<THREE.MeshBasicMaterial>;
	meshs: Array<THREE.Mesh>;
	orbitControls: OrbitControls;
	speeds: Array<Array<number>>;
	cnts: Array<number>;
	size: number;
	backgroundCube: Array<any>;
	isHistoryBack: boolean;
	groupRoatations: Array<any>;
	historys: Array<any>;
	tickCnt: number;
	group: Array<THREE.Mesh>;
	matrix4s: Array<THREE.Matrix4>;
	totalResult: any;

	constructor(public navCtrl: NavController, public elementRef: ElementRef) {
		this.cnts = new Array<number>();
		this.groupRoatations = new Array<any>();
		this.historys = new Array<any>();
		this.backgroundCube = new Array<any>();
		this.meshs = new Array<THREE.Mesh>();
		this.speeds = new Array<Array<number>>();
		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
		this.scene = new THREE.Scene();
		this.totalResult = {
			'totalCost': 0,
			'totalWinnings': 0,
			'totalMath': 0,
			'totalCostLocaleString': '0',
			'totalWinningsLocaleString': '0',
			'totalMathLocaleString': '0'
		};
	}

	@HostListener('window:resize', ['$event']) onResize(event) {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	@HostListener('window:click', ['$event']) onClick(event: MouseEvent) {
		let mouseVector = new THREE.Vector3();
		mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
		mouseVector.y = 1 - 2 * (event.clientY / window.innerHeight);
		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouseVector, this.camera);
		let intersects = raycaster.intersectObjects(this.scene.children, true);
		if (intersects && intersects.length > 0) {
			intersects.forEach((intersect, idx) => {
				let mesh = intersect.object;
				let a = Math.floor(Math.random() * 3);
				let n: number;
				if (a === 0) {
					n = Math.ceil(mesh.position.x / this.size);
				}
				if (a === 1) {
					n = Math.ceil(mesh.position.y / this.size);
				}
				if (a === 2) {
					n = Math.ceil(mesh.position.z / this.size);
				}
				this.addRotation(a, n);
			});
		}
	}

	ngAfterViewInit() {
		this.init();
		this.animate(true);
	}

	buyRottoSimul(count: number) {
		let rottoNums = new Array<number>();
		let buyRottos = Array<Array<number>>();
		let winnings = [0, 1000000000, 50000000, 1000000, 50000, 5000];

		for (let i = 0; i < count; i++) {
			buyRottos.push(getRottoBolls());
		}

		rottoNums = getRottoBolls(7);

		let sumResult = {
			'sumCost': 0,
			'sumWinnings': 0,
			'sumMath': 0
		};

		buyRottos.forEach(function (buyRotto) {
			let cnt = getCnt(rottoNums, buyRotto);
			let lank = getLank(cnt, rottoNums[rottoNums.length - 1], buyRotto);
			sumResult.sumCost += 1000;
			sumResult.sumWinnings += winnings[lank];
			sumResult.sumMath += cnt;
			if (lank > 0 && lank < 5) {
				printResult(cnt, lank, buyRotto);
			}
		});

		function printResult(cnt, lank, buyRotto) {
			console.log('');
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
			console.log(JSON.stringify(rottoNums));
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
			console.log(JSON.stringify({ 'matCnt': cnt, 'lank': lank === 0 ? '꽝' : lank + '등', 'numbers': buyRotto }));
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
			console.log(JSON.stringify(sumResult));
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		}

		this.totalResult.totalCost += sumResult.sumCost;
		this.totalResult.totalWinnings += sumResult.sumWinnings;
		this.totalResult.totalMath += sumResult.sumMath;

		this.totalResult.totalCostLocaleString = Number(this.totalResult.totalCost).toLocaleString();
		this.totalResult.totalWinningsLocaleString = Number(this.totalResult.totalWinnings).toLocaleString();
		this.totalResult.totalMathLocaleString = Number(this.totalResult.totalMath).toLocaleString();


		function getCnt(rottoNums, buyRotto): number {
			let cnt = 0;
			let len = rottoNums.length - 1;
			rottoNums.forEach(function (num, idx) {
				if (idx < len && buyRotto.indexOf(num) > -1) cnt++;
			});
			return cnt;
		}

		function getLank(cnt, bonusNum, buyRotto): number {
			let rank: number;
			if (cnt === 6) rank = 1;
			else if (cnt === 5) rank = buyRotto.indexOf(bonusNum) > -1 ? 2 : 3;
			else if (cnt === 4) rank = 4;
			else if (cnt === 3) rank = 5;
			else rank = 0;

			return rank;
		}

		function getRottoBolls(n?: number) {
			n = n || 6;
			let baseBolls = new Array<number>();
			let bolls = new Array<number>();
			for (let i = 0; i < 45; i++) {
				baseBolls.push(i + 1);
			}

			for (let i = 0; i < n; i++) {
				let r = Math.floor(Math.random() * baseBolls.length);
				bolls.push(baseBolls[r]);
				baseBolls.splice(r, 1);
			}
			return bolls;
		}
	}


	init() {
		this.cnts.push(8);
		this.cnts.push(8);
		this.cnts.push(8);
		this.size = 100;
		this.tickCnt = 5;
		this.isHistoryBack = false;
		this.totalResult = {
			'totalCost': 0,
			'totalWinnings': 0,
			'totalMath': 0,
			'totalCostLocaleString': '0',
			'totalWinningsLocaleString': '0',
			'totalMathLocaleString': '0'
		};

		this.backgroundCube.push(new THREE.CubeTextureLoader()
			.setPath('assets/textures/cube/Bridge2/')
			.load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']));
		this.backgroundCube.push(new THREE.CubeTextureLoader()
			.setPath('assets/textures/cube/skybox/')
			.load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']));
		//reflectionCube.format = THREE.RGBFormat;

		this.scene.background = this.backgroundCube[0];

		this.camera.position.set(1500, 1500, 1500);
		this.camera.lookAt(new THREE.Vector3(this.cnts[0] / 2, this.cnts[1] / 2, this.cnts[2] / 2));

		this.orbitControls = new OrbitControls(this.camera);
		this.orbitControls.target.set(this.size * this.cnts[0] / 2, this.size * this.cnts[1] / 2, this.size * this.cnts[2] / 2);
		this.orbitControls.update();

		this.geometry = new THREE.CubeGeometry(this.size, this.size, this.size);
		this.materials = [
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/imgs/image01.jpg'), transparent: true, opacity: 0.8, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/imgs/image02.jpg'), transparent: true, opacity: 0.8, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/imgs/image03.jpg'), transparent: true, opacity: 0.8, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/imgs/image04.jpg'), transparent: true, opacity: 0.8, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/imgs/image05.jpg'), transparent: true, opacity: 0.8, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/imgs/image06.jpg'), transparent: true, opacity: 0.8, color: 0xFFFFFF })
		];
		/*
		this.materials = [
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/textures/cube/skybox/px.jpg'), transparent: true, opacity: 0.75, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/textures/cube/skybox/nx.jpg'), transparent: true, opacity: 0.75, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/textures/cube/skybox/py.jpg'), transparent: true, opacity: 0.75, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/textures/cube/skybox/ny.jpg'), transparent: true, opacity: 0.75, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/textures/cube/skybox/pz.jpg'), transparent: true, opacity: 0.75, color: 0xFFFFFF }),
			new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('assets/textures/cube/skybox/nz.jpg'), transparent: true, opacity: 0.75, color: 0xFFFFFF })
		];
		*/

		let baseMesh = new THREE.Mesh(this.geometry, new THREE.MultiMaterial(this.materials));
		baseMesh.translateX(this.size / 2);
		baseMesh.translateY(this.size / 2);
		baseMesh.translateZ(this.size / 2);

		for (let x = 0; x < this.cnts[0]; x++) {
			for (let y = 0; y < this.cnts[1]; y++) {
				for (let z = 0; z < this.cnts[2]; z++) {
					let checkX = x === 0 || x === this.cnts[0] - 1;
					let checkY = y === 0 || y === this.cnts[1] - 1;
					let checkZ = z === 0 || z === this.cnts[2] - 1;
					if (checkX || checkY || checkZ) {
						let mesh = baseMesh.clone();
						mesh.translateX(this.size * x);
						mesh.translateY(this.size * y);
						mesh.translateZ(this.size * z);
						this.meshs.push(mesh);
						this.speeds.push(new Array<number>());
						this.scene.add(mesh);
					}
				}
			}
		}

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		this.elementRef.nativeElement.appendChild(this.renderer.domElement);

		this.scene.add(new THREE.AxisHelper(Math.max(this.size * this.cnts[0], this.size * this.cnts[1], this.size * this.cnts[2]) * 0.5 + this.size / 2));
	}

	start() {
		this.meshs.forEach((mesh, idx) => {
			mesh.rotation.y = Math.PI / 2 * Math.floor(D3.randomUniform(0, 4)());
		});
		this.speeds.forEach((speed, idx) => {
			let random = Math.PI / 2 * Math.floor(D3.randomUniform(4, 8)());
			let length = Math.floor(D3.randomUniform(10, random * 10)());
			this.speeds[idx] = D3.range(length).map(function (d) {
				let y1 = random * Math.sin(Math.PI / 2 / length * d);
				let y2 = random * Math.sin(Math.PI / 2 / length * (d + 1));
				return y2 - y1;
			});
		});
	}

	reset() {
		this.groupRoatations.length = 0;
		this.historys.length = 0;
		this.totalResult = {
			'totalCost': 0,
			'totalWinnings': 0,
			'totalMath': 0,
			'totalCostLocaleString': '0',
			'totalWinningsLocaleString': '0',
			'totalMathLocaleString': '0'
		};
		this.speeds.forEach((speed, idx) => {
			this.speeds[idx] = new Array<number>();
		});
		this.meshs.forEach((mesh, idx) => {
			mesh.rotation.x = 0;
			mesh.rotation.y = 0;
			mesh.rotation.z = 0;
		});
	}

	changeBackground(idx: any) {
		this.scene.background = this.backgroundCube[idx];
	}

	groupRotation(group: Array<THREE.Mesh>, mmatrix4s: Array<THREE.Matrix4>) {
		this.buyRottoSimul(10);
		group.forEach((mesh) => {
			mmatrix4s.forEach((matrix4) => {
				mesh.applyMatrix(matrix4);
			});
		});
	}

	addRotation(a: number, n?: number) {
		n = n || Math.floor(Math.random() * this.cnts[a]);
		let t = Math.PI / 2 / this.tickCnt;
		for (let i = 0; i < this.tickCnt; i++) {
			this.groupRoatations.unshift([i, a, n, t]);
		}
	}

	getGroup(a: number, n: number): Array<THREE.Mesh> {
		let g = new Array<THREE.Mesh>();
		this.meshs.forEach((mesh, idx) => {
			if (a === 0) {
				if (Math.ceil(mesh.position.x / this.size) === n) {
					g.push(mesh);
				}
			}
			if (a === 1) {
				if (Math.ceil(mesh.position.y / this.size) === n) {
					g.push(mesh);
				}
			}
			if (a === 2) {
				if (Math.ceil(mesh.position.z / this.size) === n) {
					g.push(mesh);
				}
			}
		});
		return g;
	}

	getRotationMatrix4s(a: number, t: number): Array<THREE.Matrix4> {
		let mx = this.size * this.cnts[0] / 2;
		let my = this.size * this.cnts[1] / 2;
		let mz = this.size * this.cnts[2] / 2;
		let result = Array<THREE.Matrix4>();
		result.push(new THREE.Matrix4().makeTranslation(-mx, -my, -mz));
		if (a === 0) result.push(new THREE.Matrix4().makeRotationX(t));
		if (a === 1) result.push(new THREE.Matrix4().makeRotationY(t));
		if (a === 2) result.push(new THREE.Matrix4().makeRotationZ(t));
		result.push(new THREE.Matrix4().makeTranslation(mx, my, mz));
		return result;
	}

	toogleIsHistoryBack() {
		this.isHistoryBack = !this.isHistoryBack;
	}

	animate(isEnableAddHistory: boolean) {
		this.meshs.forEach((mesh, idx) => {
			let speed = this.speeds[idx].pop();
			if (speed) {
				mesh.rotation.x += speed ? speed : 0;
				mesh.rotation.y += speed ? speed : 0;
				mesh.rotation.z += speed ? speed : 0;
			}
		});
		if (this.groupRoatations.length > 0 && isEnableAddHistory) {
			let groupRoatation = this.groupRoatations.pop();
			if (groupRoatation[0] === 0) {
				this.group = this.getGroup(groupRoatation[1], groupRoatation[2]);
				this.matrix4s = this.getRotationMatrix4s(groupRoatation[1], groupRoatation[3]);
			}
			this.groupRotation(this.group, this.matrix4s);
			this.historys.push(groupRoatation);
		}
		else {
			if (this.historys.length > 0 && (this.isHistoryBack || !isEnableAddHistory)) {
				let history = this.historys.pop();
				if (history) {
					if (history[0] === (this.tickCnt - 1)) {
						this.group = this.getGroup(history[1], history[2]);
						this.matrix4s = this.getRotationMatrix4s(history[1], - history[3]);
					}
					this.groupRotation(this.group, this.matrix4s);
					isEnableAddHistory = history[0] === 0;
				}
			}
		}
		//this.groupRotation(2, n, t);
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.animate(isEnableAddHistory));
	}
}
