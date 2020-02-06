import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      delivery_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { delivery_id } = req.body;
    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'Id da encomenda enviado é inválido' });
    }

    const deliveryProblem = await DeliveryProblem.create(req.body);

    return res.json({
      deliveryProblem,
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'Id da encomenda enviado é inválido' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      limit: 10,
      offset: (page - 1) * 10,
    });

    if (deliveryProblems.length < 1) {
      return res
        .status(400)
        .json({ error: 'Não foi encontrado nenhum problema na encomenda' });
    }

    return res.json({
      deliveryProblems,
    });
  }
}

export default new DeliveryProblemController();
