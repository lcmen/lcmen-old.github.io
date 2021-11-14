let firstLoad = true;

document.addEventListener('DOMContentLoaded', function() {
  Turbolinks.setProgressBarDelay(100);
});

document.addEventListener('turbolinks:load', function(event) {
  if(typeof ga === 'function') {
    ga("set", "location", event.data.url)
    ga("send", "pageview")
  }

  if (firstLoad) {
    firstLoad = false;
    return;
  }

  initSearch();
  toggleNav();
});
