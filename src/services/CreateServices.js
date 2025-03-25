const mongoose = require('mongoose');
const  logger = require('../logger');


const createService = (modelName) => {
    const modelF = require(`../Model/${modelName}`);
    const Model = mongoose.model(modelName); 

    const create = async (data) => {
        return Model.create(data)
            .then((data) => {
                return { status: true, data }
            })
            .catch((e) => {
                logger.error("CreateServices Error: " + modelName + ":  " + e.toString())
                return { status: false, error: e };
            });
    };

    const updateMany = async (query, data) => {
        return Model.updateMany(query, data, { new: true })
            .then((data) => {
                return { status: true, data }
            })
            .catch((e) => {
                return { status: false, error: e };
            });
    };

    const deleteById = async (id) => {
        return Model.findByIdAndDelete(id)
            .then((data) => {
                return { status: true, data }
            })
            .catch((e) => {
                return { status: false, error: e };
            });
    };

    const deleteByQuery = async (query) => {
        return Model.deleteMany(query)
            .then((data) => {
                return { status: true, data }
            })
            .catch((e) => {
                return { status: false, error: e };
            });
    };

    const findById = async (id) => {
        return Model.findById(id)
            .then((data) => {
                return { status: true, data }
            })
            .catch((e) => {
                return { status: false, error: e };
            });
    };

    const updateById = async (id, data) => {
        return Model.findByIdAndUpdate(id, data, { new: true })
            .then((data) => {
                return { status: true, data }
            })
            .catch((e) => {
                return { status: false, error: e };
            })
    };

    const count = async (query) => {
        return Model.countDocuments(query)
            .then((data) => {
                return { status: true, count: data }
            })
            .catch((e) => {
                return { status: false, error: e };
            });
    };

    const find = async (params = { query: {}, sort: { createdAt: -1 }, populate: [], start: 0, limit: 10, display: [] }) => {
        // { query: { }, sort = { createdAt: -1 }, populate = [], start = 0, limit = 10, display: [] }
        try {
            const {
                query = {},
                display = [],
                start = 0,
                limit = 10,
                populate = [],
                sort = '-createdAt',
                search = '',
            } = params;

            const count = await Model.countDocuments(query);
            const data = await Model.find(query, display)
                .populate(populate)
                .sort(sort)
                .skip(start)
                .limit(limit);

            const totalPages = Math.ceil(count / limit);

            return {
                status: true,
                data,
                count,
                totalPages,
            };
        }
        catch (e) {
            return { status: false, error: e };
        }
    };

    const aggregate = async (query = []) => {
        return Model.aggregate(query)
            .then((data) => {
                return { status: true, data: data }
            })
            .catch((e) => {
                return { status: false, error: e };
            });
    }

    return {
        create,
        updateMany,
        deleteById,
        deleteByQuery,
        findById,
        updateById,
        find,
        count,
        aggregate
    };
};

module.exports = createService;
