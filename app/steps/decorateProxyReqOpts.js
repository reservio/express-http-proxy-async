'use strict';

function defaultDecorator(proxyReqOptBuilder /*, userReq */) {
  return proxyReqOptBuilder;
}

function decorateProxyReqOpt(container) {
    var resolverFn = container.options.proxyReqOptDecorator || defaultDecorator;

    return Promise
        .resolve(resolverFn(container.proxy.reqBuilder, container.user.req, container.user.res))
        .then(function(data) {
            delete data.proxyReq.params;
            container.proxy.reqBuilder = data.proxyReq;
            container.user.res = data.res;
            return Promise.resolve(container);
    });
}

module.exports = decorateProxyReqOpt;
