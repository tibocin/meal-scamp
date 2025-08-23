const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icons/icon-128.png","icons/icon-144.png","icons/icon-152.png","icons/icon-192.png","icons/icon-384.png","icons/icon-512.png","icons/icon-72.png","icons/icon-96.png","manifest.webmanifest","service-worker.js"]),
	mimeTypes: {".png":"image/png",".webmanifest":"application/manifest+json"},
	_: {
		client: {"start":"_app/immutable/entry/start.CIoMui1b.js","app":"_app/immutable/entry/app.qRD_ZmWp.js","imports":["_app/immutable/entry/start.CIoMui1b.js","_app/immutable/chunks/entry.DLTvk-7E.js","_app/immutable/chunks/scheduler.DYjCt7Qj.js","_app/immutable/chunks/index.zANXAtWU.js","_app/immutable/entry/app.qRD_ZmWp.js","_app/immutable/chunks/scheduler.DYjCt7Qj.js","_app/immutable/chunks/index.DJsOjTB_.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./chunks/0-BVz57Z6n.js')),
			__memo(() => import('./chunks/1-CpewQphh.js')),
			__memo(() => import('./chunks/2-D7lIuGsq.js')),
			__memo(() => import('./chunks/3-CPszsSDw.js')),
			__memo(() => import('./chunks/4-Ol_o7DG6.js')),
			__memo(() => import('./chunks/5-BGp3fqBc.js')),
			__memo(() => import('./chunks/6-BVZT2pnC.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/pushover",
				pattern: /^\/api\/pushover\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BqMPLTrE.js'))
			},
			{
				id: "/api/seed",
				pattern: /^\/api\/seed\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-B0MdZBrR.js'))
			},
			{
				id: "/meals",
				pattern: /^\/meals\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/planner",
				pattern: /^\/planner\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/tracker",
				pattern: /^\/tracker\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
