
export async function scrapeUrl(url="https://recipe.ukfinda.com/hearty-lentil-and-potato-soup/",browser){
    console.log(url,"Opening Browser")
     
          console.log("Navigating to new page")
        const page = await browser.newPage();
       await page.goto(url,{ timeout: 60000, waitUntil: 'networkidle2' });
       await page.waitForSelector('script[type="application/ld+json"]', { timeout: 60000 });

          let ingredients,instructions,name,imageLink,cookTime,prepTime,description,category,cuisine,totalTime;
        //Get the header of the 
    let scriptTags = await page.$$eval(
        'script[type="application/ld+json"]',
        scripts => scripts.map(script => {
          return JSON.parse(script.textContent)})
      );
      scriptTags = await scriptTags.flat();
      let graphs = await scriptTags.find(data => data['@graph'] )
      const recipeData = await scriptTags.find(data => {
        if(Array.isArray(data['@type'])){
          return data['@type']?.includes("Recipe")
        }
        else{
          return data['@type'] === 'Recipe'
        }
      
        }) || (graphs?graphs["@graph"].find(data => {
          if(Array.isArray(data['@type'])){
            return data['@type']?.includes("Recipe")
          }
          else{
            return data['@type'] === 'Recipe'
          }
        
          }):false);

      let extractInstructions = (ins)=>{
        if(Array.isArray(ins?.itemListElement) && ins["@type"] =="HowToSection"){
          return ins.itemListElement.map(item =>{
            if(item["@type"]=="HowToStep"){
              return item.text
            }
          })
        }
      }
      await page.close()
      if (recipeData) {
        scriptTags = null;
        graphs = null
        ingredients = recipeData.recipeIngredient || [];
        instructions = recipeData.recipeInstructions?.map(step => step.text || extractInstructions(step)) || [];
        instructions = instructions.flat()
        name = recipeData.name;
        cookTime = recipeData.cookTime;
        prepTime = recipeData.prepTime;
        totalTime = recipeData.totalTime;
        description = recipeData.description;
        imageLink =  Array.isArray(recipeData.image)? recipeData.image[0] :recipeData.image
        category = recipeData?.recipeCategory
        return {
            ingredients,instructions,name,imageLink,cookTime,prepTime,totalTime,description,category
        }
      }
      else{
        return undefined
      }
  
}


