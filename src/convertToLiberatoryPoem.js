const convertToLiberatoryPoem = async (originalText, style = "liberatory") => {
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: originalText, style }),
      });
  
      const data = await response.json();
      return data.converted || originalText;
    } catch (error) {
      console.error("Conversion error:", error);
      return originalText;
    }
  };
  
  export default convertToLiberatoryPoem;
  