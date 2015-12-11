![SLIDE-ZILLA](https://raw.githubusercontent.com/codezilla-nl/slide-zilla/master/media/logo.png)
==============

An easy to use plugin to create full screen page slides that supports all screen sizes. 

Check out a demo at: http://codezilla-nl.github.io/slide-zilla/

Features
=========

+ Support for mobile devices with media queries
+ Includes a navigation bar
+ Cross browser compatible Cross browser compatibility (IE9+, Chrome, Firefox, Safari and Opera)

How to use
==========
* Include jQuery on your page
* Include slidezilla.js on your page

* Include slidezilla.css for basic styling

* Add the HTML markup to your page
```html
<div id="page">
    <nav class="page-nav sz-nav-visible">
        <a class="sz-nav-handle" title="Menu" href="">
            <span class="fa fa-bars"></span> Menu
        </a>
        <ul class="sz-nav-items">
            <li><a href="#slide1">Slide 1</a></li>
            <li><a href="#slide2">Slide 2</a></li>
            <li><a href="#slide3">Slide 3</a></li>
        </ul>
    </nav>

    <section id="slide1">
        ...
    </section>

    <section id="slide2">
        ...
    </section>

    <section id="slide3">
       ...
    </section>

</div>
```
* Link Slide-zilla to your HTML elements
```javascript
 $('#page').slidezilla({
    navigation: '.page-nav',
    slide: 'section'
});
```


Get
=======

### Bower

    bower install slide-zilla

### NPM

    npm install slide-zilla

ToDo
====
- Events

If you have good ideas / tips about options / functionality, let me know!


Support
=======
If you have any questions, problems or suggestions, feel free to submit a ticket!
Also, pull requests with improvements, new features or other great stuff are always very welcome.

Licence
=======
MIT
