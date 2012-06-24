!function() {
	this.DatePicker = ctor;

	ctor.prototype =
		{ show: show
		, hide: hide
		, toggle: toggle

		, render: render
		, on: on
		, off: off

		, emit: emit
		, trigger: emit

		, resolveSelector: resolveSelector
		, renderControls: renderControls
		, renderHeaderLabels: renderHeaderLabels
		, renderDateCells: renderDateCells
		, nextMonth: nextMonth
		, prevMonth: prevMonth
		, dateCellClicked: dateCellClicked
		};

	ctor.getCurrentMonth = getCurrentMonth;
	ctor.getOverflowNext = getOverflowNext;
	ctor.getOverflowPrev = getOverflowPrev;

	function ctor(container, options) {
		this.container = container;
		this.options =
			{ weekStart: 1 // 1 == monday
			, weekdays: [ 'su', 'mo', 'tu', 'we', 'th', 'fr', 'sa' ]
			, months: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
			, buttons: { next: 'Next', prev: 'Prev' }
			, date: new Date()
			};

		this._events = {};
		this._elms = {};

		if(options) {
			Object.keys(options).forEach(function(key) {
				this.options[key] = options[key];
			}, this);
		}

		[ 'nextMonth'
		, 'prevMonth'
		, 'dateCellClicked'
		]
			.forEach(function(func) {
				this[func] = this[func].bind(this);
			}, this)
	};

	function on(event, callback) {
		if(typeof(callback) != 'function') {
			throw new Error('Second argument needs to be a function');
		}
		if(!this._events[event]) {
			this._events[event] = [];
		}
		this._events[event].push(callback);

		return this;
	};
	function off(event, callback) {
		if(!this._events[event]) {
			return;
		}
		var index
		while((index = this._events[event].indexOf(callback)) > -1) {
			this._events[event].splice(index, 1);
		}

		return this;
	};
	function emit(event) {
		var listeners = this._events[event]
		  , args = Array.prototype.slice.call(arguments, 1)

		if(listeners) {
			listeners.forEach(function(cb) {
				cb.apply(null, args);
			});
		}

		return this;
	};

	function dateCellClicked(event) {
		var elm = event.target
		  , date = elm.dataset.date

		if(!date) {
			return;
		}

		if(this._elms.input) {
			this._elms.input.value = date;
		}

		date = date.split('/');

		this.options.date.setFullYear(date[0]);
		this.options.date.setMonth(date[1]-1);
		this.options.date.setDate(date[2]);

		this.emit('change', this.options.date, this);

		if(this._elms.floater) {
			this.hide();
			return;
		}

		this.show();
	};
	function nextMonth() {
		this.options.date.setDate(1);
		this.options.date.setMonth(this.options.date.getMonth() + 1);

		this.show();
	};
	function prevMonth() {
		this.options.date.setDate(1);
		this.options.date.setMonth(this.options.date.getMonth() - 1);

		this.show();
	};

	function render() {
		var frag = document.createDocumentFragment()
		  , now = this.options.date
		  , opts =
		    { weekdays: getWeekdays(this.options)
		    , 'prev-month': getOverflowPrev(now, this.options)
		    , 'next-month': getOverflowNext(now, this.options)
		    , 'cur-month': getCurrentMonth(now)
		    }

		frag.appendChild(this.renderControls());
		frag.appendChild(this.renderHeaderLabels());
		frag.appendChild(this.renderDateCells());

		$$('.fzk-dp-btn-nxt', frag)[0].onclick = this.nextMonth;
		$$('.fzk-dp-btn-prv', frag)[0].onclick = this.prevMonth;
		$$('.fzk-dp-cells', frag)[0].onclick = this.dateCellClicked;
		return frag;
	};
	function renderControls() {
		var div = createElement('div', { className: 'fzk-dp-ctrls' })
		  , now = this.options.date
		div.appendChild(createElement('label',
			{ className: 'fzk-dp-month'
			, innerHTML: this.options.months[now.getMonth()] + ' ' + now.getFullYear()
			}
		));
		div.appendChild(createElement('button',
			{ className: 'fzk-dp-btn-prv'
			, innerHTML: this.options.buttons.prev
			}
		));
		div.appendChild(createElement('button',
			{ className: 'fzk-dp-btn-nxt'
			, innerHTML: this.options.buttons.next
			}
		));
		return div;
	};
	function renderHeaderLabels() {
		var div = createElement('div', { className: 'fzk-dp-lbls' })
		getWeekdays(this.options).forEach(function(weekday) {
			div.appendChild(createElement('label',
				{ className: 'fzk-dp-cell'
				, innerHTML: weekday
				}
			));
		});
		return div;
	};
	function renderDateCells() {
		var div = createElement('div', { className: 'fzk-dp-cells' })
		  , date = this.options.date
		  , dateStr = date.getFullYear() + '/' + padDate(date.getMonth() +1) + '/' + padDate(date.getDate())
		  , now = new Date()
		  , nowStr = now.getFullYear() + '/' + padDate(now.getMonth() +1) + '/' + padDate(now.getDate())

		getOverflowPrev(date, this.options).forEach(addToDiv('fzk-dp-cell-prv'));
		getCurrentMonth(date).forEach(addToDiv(''));
		getOverflowNext(date, this.options).forEach(addToDiv('fzk-dp-cell-nxt'));

		return div;

		function addToDiv(className) {
			return function(date) {
				var opts =
					{ className: 'fzk-dp-cell ' + className
					, innerHTML: date.date
					}
				  , data = { date: date.fullDate }
				if(nowStr === date.fullDate) {
					opts.className += ' fzk-dp-cell-today';
				}
				if(dateStr === date.fullDate) {
					opts.className += ' fzk-dp-cell-current';
				}
				div.appendChild(createElement('span', opts, data));
			};
		};
	};

	function getWeekdays(opts) {
		var days = []
		  , i
		  , current = opts.weekStart

		for(i = 0; i < 7; i++) {
			days[i] = opts.weekdays[current++];
			if(current == 7) current = 0;
		};

		return days;
	};
	function getCurrentMonth(now, opts) {
		var year = now.getFullYear()
		  , month = padDate(now.getMonth() + 1)
		  , day = now.getDate()
		  // we do not need to subtract one here, since that has already been done
		  , lastDay = new Date(year, +month, 0).getDate()
		  , days = []
		  , i

		for(i = 1; i <= lastDay; i++) {
			var date = padDate(i)
			days.push(
				{ date: date
				, fullDate: year + '/' + month + '/' + date
				, current: day === i
				}
			);
		}

		return days;
	};
	function getOverflowPrev(now, opts) {
		var firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		if(firstDayOfMonth.getDay() == opts.weekStart) {
			return [];
		}

		var previousMonth = new Date(now.getFullYear(), now.getMonth(), 0)
		  , year = previousMonth.getFullYear()
		  , month = padDate(previousMonth.getMonth() + 1)
		  , lastDate = previousMonth.getDate()

		  , currentDay = firstDayOfMonth.getDay()
		  , results = []
		  , i
		  , l = currentDay - opts.weekStart

		if(l < 0) l += 7;

		for(i = 0; i < l; i++) {
			var currentDate = (lastDate - l + i + 1).toString()
			results.push(
				{ date: currentDate
				, fullDate: year + '/' + month + '/' + currentDate
				}
			);
		}
		return results;
	};
	function getOverflowNext(now, opts) {
		var firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth()+1, 1)
		if(firstDayOfNextMonth.getDay() == opts.weekStart) {
			return [];
		}

		var year = firstDayOfNextMonth.getFullYear()
		  , month = padDate(firstDayOfNextMonth.getMonth() +1)

		  , result = []
		  , i = firstDayOfNextMonth.getDay() - opts.weekStart
		  , l = 7
		  , current = 1

		if(i < 0) {
			i += 7
		}

		for(; i < l; i++) {
			var date = padDate(current++)
			result.push(
				{ date: date
				, fullDate: year + '/' + month + '/' + date
				}
			);
		}

		return result;
	};
	function padDate(date) {
		date = +date;
		return date < 10 ? '0' + date : date.toString();
	};

	function show() {
		this.resolveSelector(this.container);
		if(!/(^| )fzk-dp($| )/.test(this.container.className)) {
			this.container.className += ' fzk-dp';
		}
		this.container.innerHTML = '';
		this.container.appendChild(this.render());

		this.showing = true;

		return this.emit('show', this);
	};
	function hide() {
		this.container.innerHTML = '';
		if(this._elms.floater) {
			this._elms.floater.parentNode.removeChild(this._elms.floater);
			this._elms.floater = null;
		}
		this.showing = false;

		return this.emit('hide', this);
	};
	function toggle() {
		if(this.showing) {
			return this.hide();
		}
		return this.show();
	};

	function resolveSelector(sel) {
		if(typeof(this.container) === 'string') {
			this.container = $$(this.container)[0];
		}
		if(!this.container) {
			throw new Error('<' + sel + '> does not resolve to any element!');
		}
		if(this.container.tagName.toLowerCase() === 'input') {
			this._elms.input = this.container;
		}
		if(this._elms.floater) {
			this.container = this._elms.floater;
			return;
		}
		if(this._elms.input) {
			this._elms.floater = this.container
				= createElement('div', { className: 'fzk-dp-float' });
			this._elms.input.parentNode.appendChild(this._elms.floater);
			var offset = getOffset(this._elms.input);
			this.container.style.left = offset.left;
			this.container.style.top = offset.top;
		}
	};

	/**
	 * This code is most graciously stolen from jQuery:
	 * https://github.com/jquery/jquery/blob/7c23b77af2477417205/src/offset.js
	 */
	function getOffset(elm) {
		var box = elm.getBoundingClientRect()
		  , doc = elm.ownerDocument
		  , body = doc.body
		  , docElm = doc.documentElement

		  , scroll =
		    { top: docElm.scrollTop
		    , left: docElm.scrollLeft
		    }
		  , client =
		    { top: docElm.clientTop || body.clientTop || 0
		    , left: docElm.clientLeft || body.clientLeft || 0
		    }

		return (
			{ top: box.top + scroll.top - client.top
			, left: box.left + scroll.left - client.left
			}
		);
	};

	function createElement(tag, opts, data) {
		var elm = document.createElement(tag);
		if(opts) {
			Object.keys(opts).forEach(function(key) {
				elm[key] = opts[key];
			});
		}
		if(data) {
			Object.keys(data).forEach(function(key) {
				elm.dataset[key] = data[key];
			});
		}
		return elm;
	};

	function $(id) {
		return document.getElementById(id);
	};
	function $$(selector, scope) {
		return Array.prototype.slice.call(
			(scope || document).querySelectorAll(selector));
	};
}();
