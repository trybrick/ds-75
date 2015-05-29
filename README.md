# Coborns

This respository demonstrate how Retailer fork a GSN bootstrap theme https://github.com/gsn/ds-bootstrap

## What is a Theme?
A Theme represent all engine pages generically create/templated by GSN.  This include: circular, coupon, etc...

* Pro: This provide maxinum flexibility for customization.
* Con: Retailer would have to maintain or notify GSN of any bug that need to be fix.  GSN automatically fix any bug that occur on the generic theme; but since this is a fork, Retailer would have to manage any bug result from the template.


To run this repository locally, you will need nodejs:  
```
npm install
```

To Run:

```
node serverApp.js 75
```

Then open your browser to: http://localhost:3075

Otherwise, this repository is monitored by GSN continous integration process.  Any changes will be published shortly to a specific environment.
