var cron = require ('node-cron');
var https = require ('https');
var nodeParser = require ('node-html-parser');
var parse = nodeParser.parse;

var nodemailer = require("nodemailer");
var smtp = {
    host: "***************",
    port: 587,
    secure: false,
    auth: {
        user: "***************",
        pass: "***************"
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
};

var globalMailOptions = {
    from: "***************",
    to: "***************",
    subject: "Carte graphique disponible!"
  }

cron.schedule('* * * * *', monitorgpu);
monitorgpu();

function monitorgpu()
{
    var websites = [
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-geforce-rtx-3070-a-memoire-gddr6-de-8-go-de-nvidia-exclusivite-bby/15078017', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/nvidia-geforce-rtx-3070-ti-8gb-gddr6x-video-card/15530046', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-geforce-rtx-3070-xc3-ultra-a-memoire-gddr6-de-8-go-d-evga/15147122', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/asus-rog-strix-nvidia-geforce-rtx-3070-ti-oc-8gb-gddr6x-video-card/15546964', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-nvidia-geforce-rtx-3070-ventus-3x-oc-de-msi-avec-memoire-gddr6-de-8-go/15038016', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/msi-nvidia-geforce-rtx-3070-ti-gaming-x-trio-8gb-gddr6x-video-card/15547752', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/msi-nvidia-geforce-rtx-3070-ti-ventus-3x-oc-8gb-gddr6x-video-card/15547753', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-tuf-gaming-nvidia-geforce-rtx-3070-2x-oc-a-memoire-gddr6-de-8-go-d-asus/15053087', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/zotac-nvidia-geforce-rtx-3070-ti-amp-holo-8gb-gddr6x-video-card/15545267', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-gddr6-de-8-go-nvidia-geforce-rtx-3070-amp-holo-de-zotac/15268899', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-nvidia-geforce-rtx-3070-twin-edge-oc-de-zotac-avec-memoire-gddr6x-de-8-go/15000078', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-nvidia-geforce-rtx-3070-twin-edge-de-zotac-avec-memoire-gddr6x-de-8-go/15000079', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-nvidia-geforce-rtx-3070-x-trio-a-memoire-gddr6-de-8-go-de-msi/15459513', method: 'GET'},
        {hostname: 'www.bestbuy.ca', port: 443, path: '/fr-ca/produit/carte-graphique-geforce-rtx-3070-ventus-2x-oc-de-msi-avec-memoire-gddr6-de-8-go/15468905', method: 'GET'}
    ]

    for(const website of websites)
    {
        var req = https.request(website, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
              const root = parse(chunk);
              var spans = root.querySelectorAll('button');
              spans = spans.filter(x => x.innerText === "Achetez");
              if(spans.length > 0)
              {
                  for(const span of spans){
                      var isAddToCart = false;
                      var isDisabled = false;
                      for(const cssClass of span.classList.values())
                      {
                        if(new RegExp("addToCartButton", "gi").test(cssClass))
                        {
                            isAddToCart = true;
                        }

                        if(new RegExp("disabled", "gi").test(cssClass))
                        {
                            isDisabled = true;
                        }
                      }

                      if(isAddToCart && !isDisabled)
                      {
                          var html = website.hostname + website.path;

                          var transporter = nodemailer.createTransport(smtp);
                          var mailOptions = {
                              from: globalMailOptions.from,
                              to: globalMailOptions.to,
                              subject: globalMailOptions.subject,
                              html: html
                          }

                          transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                          });
                      }
                  }
              }
            });
          });

        req.end();
    }

    console.log(new Date() + ': cycle completed;')
}