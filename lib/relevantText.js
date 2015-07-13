module.exports = ( function (){

	var dbg = (typeof console !== 'undefined') ? function(s) {
    	//console.log("relevantText: " + s);
	} : function() {};
	
	relevantText = {
	    
	    regexps: {
	        //comment
	        unlikelyCandidates:    /combx|community|disqus|extra|foot|header|menu|remark|rss|shoutbox|sidebar|sponsor|ad-break|agegate|pagination|pager|popup|tweet|twitter|facebook/i,
	        okMaybeItsACandidate:  /and|article|body|column|main|shadow/i,
	        replaceBrs:            /(<br[^>]*>[ \n\r\t]*){2,}/gi
	    },

		// Tamanho mínimo do conteúdo
	    MIN_CONTENT_LENGTH : 25,

	     isHidden : function (document,node,window) {
	         return window.getComputedStyle(node,null).getPropertyValue("display") === 'none';
	     },

	     removeHidden: function(document,window){
	        var elements = document.querySelectorAll('*'),
	            hels = [];

	            for (var i = elements.length - 1; i >= 0; i--) {
	                var node =elements[i];
	                if (node.style.visibility === 'hidden' || node.style.display === 'none' ||relevantText.isHidden(document,node,window)) {
	                   hels.push(node);
	                };
	            };

	            for (var i = hels.length - 1; i >= 0; i--) {
	                node = hels[i];
	                node.parentNode.removeChild(node);
	            };

	     },

	    init: function(document,window){
	        window.onload = window.onunload = function() {};

	        relevantText.removeScripts(document);
	        relevantText.removeHidden(document,window);

	        var firstH1 = document.getElementsByTagName('h1');
	        var firstH2 = document.getElementsByTagName('h2');
	        var title;
	        if (firstH1.length > 0) {
	            title = firstH1[0].innerHTML;
	        }else if(firstH2.length > 0){
	            title = firstH2[0].innerHTML;
	        };

	        /* Remove all stylesheets */
	        for (var k=0;k < document.styleSheets.length; k+=1) {
	            if (!!document.styleSheets[k].href && document.styleSheets[k].href.lastIndexOf("readability") === -1) {
	                document.styleSheets[k].disabled = true;
	            }
	        }

	        /* Remove all style tags in head (not doing this on IE) - TODO: Why not? */
	        var styleTags = document.getElementsByTagName("style");
	        for (var st=0;st < styleTags.length; st+=1) {
	            styleTags[st].textContent = "";
	        }

	        document.body.innerHTML = document.body.innerHTML.replace(relevantText.regexps.replaceBrs, '</p><p>');

	        var unlikes = document.querySelectorAll('*');
	        unlikes = Array.prototype.slice.call(unlikes, 0);
	        unlikes = unlikes
	        unlikes = unlikes.map(function(node){
	            var unlikelyMatchString =  node.className + node.id;
	            if (
	                    node.parentNode &&
	                    node.tagName !== "BODY" &&
	                    unlikelyMatchString.search(relevantText.regexps.unlikelyCandidates) !== -1 &&
	                    unlikelyMatchString.search(relevantText.regexps.okMaybeItsACandidate) === -1
	                )
	            {
	                dbg("Removing unlikely candidate - "+node.tagName + unlikelyMatchString);
	                //console.debug([node]);
	                node.parentNode.removeChild(node);
	            };
	            return node;
	        });

	        var isDescendant = function (child) {
	            var node = child.parentNode;
	            while (node != null) {
	                if (node.tagName === 'P'
	                    || node.tagName === 'PRE'
	                    || node.tagName === 'CODE') {
	                    return true;
	                }
	                node = node.parentNode;
	            }
	            return false;
	        };

	        // Cria uma nova div para adicionar o conteúdo de importância;
	        var articleDIV = document.createElement("DIV");

	        // Obtem todos os elementos importantes;
	        var elements = document.querySelectorAll('p,pre,code,.sectionContent .sectionTableSingleCell');
	        // transforma o array do jsdom em um array do javascript
	        elements = Array.prototype.slice.call(elements, 0);

	        // remove as tags p irelevantes.
	        // elements = elements.filter(function(itm,i,a){
	        //     return itm.tagName === 'CODE' || itm.textContent.length > relevantText.MIN_CONTENT_LENGTH;
	        // });

	        // Obtém todos os pais, pois os elementos podem ter irmãos relevantes como tags h1,h2,ul,li
	        elements = elements.map(function(el){return el.parentNode})
	        // Realiza um distinc entre os pais
	            .filter(function(itm,i,a){

	                return i==a.indexOf(itm) && !isDescendant(itm) // checa os descendentes para manter ordem de elementos internos

	                    // Itens diferentes da procura ajudam a manter a ordem dos elementos.
	                     && itm.tagName !== 'P'
	                     && itm.tagName !== 'PRE'
	                     && itm.tagName !== 'CODE';
	            });

	        if (title && elements.length > 0) {
	            var tH1 = document.createElement('h1');
	            tH1.innerHTML = title;
	            articleDIV.appendChild(tH1);
	        };

	        for (var i = 0; i < elements.length; i++) {
	            var node = elements[i];
	            // Remover todos os pais dos seus avós
	            node.parentNode.removeChild(node);
	            // Adiciona cada pai na div criada
	            articleDIV.appendChild(node);
	        };
	        // Por fim obtém o conteúdo da div
	        //document.body.innerHTML = articleDIV.textContent.trim().replace(/\s+/g, " ");
	        document.body.innerHTML = articleDIV.innerHTML;
	    },
	    /**
	     * Removes script tags from the document.
	     *
	     * @param Element
	    **/
	    removeScripts: function (doc) {
	        var scripts = doc.getElementsByTagName('script');
	        for(var i = scripts.length-1; i >= 0; i-=1)
	        {
	            if(typeof(scripts[i].src) === "undefined" || (scripts[i].src.indexOf('readability') === -1 && scripts[i].src.indexOf('typekit') === -1))
	            {
	                scripts[i].nodeValue="";
	                scripts[i].removeAttribute('src');
	                if (scripts[i].parentNode) {
	                        scripts[i].parentNode.removeChild(scripts[i]);          
	                }
	            }
	        }
	    }
	};

	function browserTearDown(browser){
		if (browser.window) {
			browser.window.close();
	    }
	    browser.destroy();
	    browser.resources = null;
	};

	// private section
	function fromURI(uri, callback){
		
		var Browser = require("zombie");
		var browserOptions = {
			debug: false,
			loadCSS: false,
			silent: true
		    //userAgent:'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.72 Safari/537.36'
		};

		Browser.visit(uri,browserOptions, function (e, browser) {
            
			// if (e) {throw e}; // Mesmo com erros a página pode ter sido renderizada.
            var dom = browser.window.document;
            if (!dom.body) {
                browserTearDown(browser);
                callback("DOM BODY NOT FOUND",null);
            } else {
                var htmlPage = browser.html();
                var content;
                try {
                    relevantText.init(dom, browser.window);
                    content = dom.body.textContent.trim().replace(/\s+/g, " ");//.substring(0,200);
                }catch(e){
                    console.log("RelevantText: " + e.stack);
                }
                browserTearDown(browser);
                callback(null,content || '');
            }
		});
		
		return;
	};

	// Expõe a função
	return {
		fromURI : fromURI
	}

})();