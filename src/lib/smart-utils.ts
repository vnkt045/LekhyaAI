
/**
 * Smart Form Utilities for Indian Context
 */

export const fetchPincodeDetails = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) return null;

    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();

        if (data && data[0] && data[0].Status === 'Success') {
            const details = data[0].PostOffice[0];
            return {
                city: details.District,
                state: details.State,
                country: 'India'
            };
        }
    } catch (error) {
        console.error("Pincode fetch error:", error);
    }
    return null;
};

export const validateGSTIN = (testGstin: string) => {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(testGstin);
};

export const extractPANFromGSTIN = (gstin: string) => {
    if (gstin && gstin.length >= 12) {
        // GSTIN format: 22AAAAA0000A1Z5 -> PAN is chars 2 to 12 (index 2 to 12 in 0-indexed? No. 
        // 01(State) PAN(10) Entity(1) Z Check(1)
        // 2 chars state code + 10 chars PAN.
        return gstin.substring(2, 12);
    }
    return null;
};

export const formatInputToUpperCase = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
    return e;
};

export const validateIFSC = (ifsc: string) => {
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return regex.test(ifsc);
};

export const fetchIFSCDetails = async (ifsc: string) => {
    if (!validateIFSC(ifsc)) return null;

    try {
        const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
        const data = await res.json();

        if (data && !data.Error) {
            return {
                bank: data.BANK,
                branch: data.BRANCH,
                city: data.CITY,
                state: data.STATE
            };
        }
    } catch (error) {
        console.error("IFSC fetch error:", error);
    }
    return null;
};
