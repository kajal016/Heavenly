const Listing=require("../models/listing.js");

module.exports.index=async(req,res)=>{
    let datas=await Listing.find();
    res.render("./listings/index.ejs",{datas});
};
module.exports.renderSearch=async(req,res)=>{
    let datas=await Listing.find({country:{ $regex: req.query.location, $options: "i" }});
    console.log(datas);
    res.render("./listings/search.ejs",{datas});
};
module.exports.renderFilter=async (req, res) => {
  let { category } = req.query;
  let filter = {};

  if (category) {
    filter.category = category; }

  let datas = await Listing.find(filter);
  res.render("listings/index.ejs", { datas });
};


module.exports.renderNewForm=(req,res)=>{
    res.render("./listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const data=await Listing.findById(id).populate({path:"reviews",populate:{ path:"author"}}).populate("owner");
    if(!data){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{data});
};

module.exports.createListing=async(req,res)=>{
    let url=req.file.path;
    let filename=req.file.filename;
   
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const data=await Listing.findById(id); 
    if(!data){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=data.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("./listings/edit.ejs",{data,originalImageUrl});
};

module.exports.updateListing=async(req,res)=>{
   
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    
    req.flash("success","Listing Updated!");
   
    res.redirect(`/listings/${id}`);
};

module.exports.destoryListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};