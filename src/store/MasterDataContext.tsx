import { createContext, useContext, useEffect, useState } from 'react';
import {
  getCategories,
  getParts,
  getStages,
  getDefects,
} from '../services/masterDataAPI';

const MasterDataContext = createContext<any>(null);

export const MasterDataProvider = ({ children }: any) => {
    const [categories, setCategories] = useState([]);
    const [parts, setParts] = useState([]);
    const [stages, setStages] = useState([]);
    const [defects, setDefects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMasterData = async () => {
        try {
            const [cat, part, stage, defect] = await Promise.all([
                getCategories(),
                getParts(),
                getStages(),
                getDefects(),
            ]);

            setCategories(cat);
            setParts(part);
            setStages(stage);
            setDefects(defect);
        } catch (error) {
            console.error('Failed to load master data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    return (
        <MasterDataContext.Provider
            value={{
                categories,
                parts,
                stages,
                defects,
                loading,
                refresh: fetchMasterData,
            }}
        >
            {children}
        </MasterDataContext.Provider>
    );
};

export const useMasterData = () => useContext(MasterDataContext);