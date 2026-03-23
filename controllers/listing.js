const Listing = require("../models/listing.js");

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("Listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{

    res.render("Listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    })
    .populate("owner");

    if(!listing)
    {
    req.flash("error","page not exist you request for");
      return  res.redirect("/listings");
    }
    console.log(listing);
    res.render("Listings/show.ejs",{listing});
}

module.exports.createNewListing = async(req,res)=>{

    //REQ.FILE mai pura data jasha  image ka data , path , filename sabkuch hota hai ek object kai rup ammi
    if (!req.file) {
        req.flash("error", "Image upload failed");
        return res.redirect("/listings/new");
    }


    let url = req.file.path;
    let filename = req.file.filename;
  
    const newlisting = new Listing(req.body.listing);

    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
    await newlisting.save();
    req.flash("succes" , "NEW PAGE ADDED SUCCESFULLY");
    res.redirect("/listings");
}

module.exports.editFormRender = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
     if(!listing)
    {
        req.flash("error","page not exist you request for");
      return  res.redirect("/listings");
    }

    //previous image ko show krana size and quality kam jyada krka 
    let ourl = listing.image.url;
   ourl =  ourl.replace("/upload","/upload/h_200,w_200");

    res.render("Listings/edit.ejs",{listing , ourl });
}

module.exports.updateListing = async(req,res) =>{
  
    let {id} = req.params;
   let listing =  await Listing.findByIdAndUpdate(id,{...req.body.listing});

    
    if(typeof  req.file!="undefined" )
    {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = {url,filename};
    await listing.save();
    }

    req.flash("succes" , "UPDETED SUCCESFULLY");
    res.redirect("/listings");
}

module.exports.destroyListing = async(req,res)=>
{
    let {id} = req.params;
    let dl =  await Listing.findByIdAndDelete(id);
  console.log(dl);
   req.flash("succes" , "LISTING DELETED SUCCESFULLY");
    res.redirect("/listings");
}
