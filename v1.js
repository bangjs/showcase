;!function (angular) {

angular.module('linkSnippetComposer', ['bang']).
	directive('showcaseImage', showcaseImage).
	controller('compose', Controller);

function Controller($scope, $http, Bacon, bang) {
	bang.component($scope, {

		scrape: {

			start: bang.stream.method(angular.identity),

			result: bang.property.digest(function () {
				return this.scrape.start.flatMapLatest(function (url) {
					return Bacon.fromPromise(
						$http.get('http://scraper.nouncy.be', {
							params: { url: url }
						})
					).map('.data.metadata');
				});
			})

		},

		image: {

			// selected: bang.property.digest(function (sink, me) {
			// 	var current;
			// 	me.onValue(function (url) {
			// 		current = url;
			// 	});

			// 	sink(undefined);
			// 	this.image.selectables.onValue(function (urls) {
			// 		sink(urls[0] || null);
			// 	});

			// 	return this.image.select.flatMapLatest(function (delta) {
			// 		return this.image.selectables.map(function (urls) {
			// 			var index = urls.indexOf(current) + delta;
			// 			index %= urls.length;
			// 			if (index < 0) index += urls.length;
			// 			return urls[index];
			// 		}).take(1);
			// 	}.bind(this));
			// }),

			selected: bang.property.digest(function () {
				return this.image.selectables.flatMapLatest(function (urls) {
					return this.image.select.
						scan(0, function (cursor, delta) {
							return cursor + delta;
						}).
						map(function (cursor) {
							var index = cursor % urls.length;
							if (index < 0) index += urls.length;
							return urls[index];
						});
				}.bind(this));
			}),

			selectables: bang.property.digest(function (sink) {
				this.scrape.result.onValue(function (data) {
					sink(data.image || []);
				});
			}),

			select: bang.stream.method(angular.identity)

		},

		input: {

			title: bang.property.watch(function () {
				return this.scrape.result.map('.title.0');
			}),

			description: bang.property.watch(function (sink) {
				this.scrape.result.onValue(function (data) {
					sink(data.title[0]);
				});
			})

			// `url` is assigned by the view but we don't care about it here so we
			// simply don't mention it.

		}

	});
}

function showcaseImage() {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			scope.$watch(attr.showcaseImage, function (url) {
				element.css('background-image', !url ? "" :
					// Surround URL with quotes because doing so means those
					// are the only characters that need to be escaped.
					"url('" + url.replace("'", "\\'") + "')"
				);
			});
		}
	};
}

}(window.angular);