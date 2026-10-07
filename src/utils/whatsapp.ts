export function cleanPhoneNumber(phone: string): string {
  // Cleans "+92 332 5099930" to "923325099930"
  return phone.replace(/[^0-9]/g, '');
}

export function createWhatsAppLink(phone: string, message: string): string {
  const cleaned = cleanPhoneNumber(phone || '+923325099930');
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

export function getGeneralWhatsAppLink(phone: string, brandName = 'Wood Care Furniture'): string {
  return createWhatsAppLink(
    phone,
    `Hi ${brandName}, I would like to know more about your furniture collection.`
  );
}

export function getProductWhatsAppLink(phone: string, productName: string, brandName = 'Wood Care Furniture'): string {
  return createWhatsAppLink(
    phone,
    `Hi ${brandName}, I am interested in "${productName}". Please share the details, custom dimensions, and craft options.`
  );
}

export function getCategoryWhatsAppLink(phone: string, categoryName: string, brandName = 'Wood Care Furniture'): string {
  return createWhatsAppLink(
    phone,
    `Hi ${brandName}, I am interested in your ${categoryName} furniture. Please share more details and available designs.`
  );
}

export function getCustomQuoteWhatsAppLink(phone: string, brandName = 'Wood Care Furniture'): string {
  return createWhatsAppLink(
    phone,
    `Hi ${brandName}, I would like to get a quote for a custom furniture design. I can share reference images and required dimensions.`
  );
}
